const express = require('express');
const passport = require('passport');

const noCache = require('../lib/middleware/no-cache');
const ensureAuthenticated = require('../lib/middleware/ensure-authenticated');
const isAuthorizedTo = require('../lib/middleware/is-authorized-to');
const rsa = require('../lib/encryptors/rsa');
const authorization = require('../domain/authorization');

const models = require('../models');
const uuid = require('uuid').v4;
const logger = require('../lib/logger');
const domain = require('../domain');

module.exports = (config, repositories, encryption) => {

  const ensureAuthenticatedInstance = ensureAuthenticated(repositories);
  const domainInstance = domain(repositories, encryption);
  const dataRetrieval = domainInstance.dataRetrieval;
  const {
    createAKey,
    updateAKey
  } = authorization(repositories);
  
  const router = express.Router();

  router.use(noCache);
  router.use(ensureAuthenticatedInstance);

  router.get('/create', isAuthorizedTo(createAKey), async (req, res, next) => {
    try {
      return await res.renderView({view: 'keys/create'});
    }
    catch (err) {
      return next(err);
    }
  });

  router.post('/create', isAuthorizedTo(createAKey), async (req, res) => {
    res.set('Content-Type', 'application/json; charset=utf-8');

    try {
      let body = req.body || {};
      body.updatedBy = { userId: req.user.userId, userName: req.user.userName };
      let key = new models.key(body);

      if (!key.isValid()) {
        return res.sendStatus(400);
      }

      key = await encryption.encryptKey(key);
      key.updated = new Date();
      key.updatedBy = { userId: req.user.userId, userName: req.user.userName };
      await repositories.key.add(key);
      return res.status(200).send({ location: '/key/all' });
    }
    catch (err) {
      if (repositories.isDuplicate(err)) {
        res.status(200).send({error: 'The key name you have specified is already in use'});
      }
      else {
        logger.error(err);
        res.sendStatus(500);
      }
    }
  });
  
  router.post('/decrypt', isAuthorizedTo(updateAKey), async (req, res) => {

    res.set('Content-Type', 'application/json; charset=utf-8');

    try {
      let body = req.body || {};
      let value = body.valueToDecrypt;
      let privateKeyValue = body.privateKey;

      if (!value || !privateKeyValue) {
        return res.status(400).send().end();;
      }

      let decryptedValue = await rsa.decryptFromPrivateKey(value, privateKeyValue);

      if (decryptedValue === 'elency-config:DecodingError') {
        return res.sendStatus(500)
      }

      return res.status(200).send({ value: decryptedValue }).end();
    }
    catch (err) {
      res.sendStatus(500);
      logger.error(err);
    }
  });

  router.get('/:keyId/update', isAuthorizedTo(updateAKey), async (req, res, next) => {

    try {
      const key = await dataRetrieval.getKey(req.params.keyId);
      const viewData = { key };
      return await res.renderView({ view: 'keys/update', viewData });
    }
    catch (err) {
      next(err);
    }
  });

  router.post('/:keyId/update', isAuthorizedTo(updateAKey), async (req, res) => {
    res.set('Content-Type', 'application/json; charset=utf-8');

    try {
      let body = req.body || {};
      
      if(!body.keyName || body.description === undefined || body.changingKeyValue === undefined) {
        return res.sendStatus(400);
      }

      const changingKeyValue = (body.changingKeyValue === true || body.changingKeyValue === 'true');
      const keyName = body.keyName.trim();
      const description = body.description.trim();
      const keyValue = body.value !== undefined ? body.value.trim() : '';

      if (keyName.length < 1 || (changingKeyValue && keyValue.length !== 32)) {
        return res.sendStatus(400);
      }

      if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(keyValue)) {
        return res.sendStatus(400);
      }

      let key = await dataRetrieval.getKey(req.params.keyId);
      let originalKeyName = key.keyName;

      key.keyName = keyName;
      key.description = description;
      key.updated = new Date();
      key.updatedBy = { userId: req.user.userId, userName: req.user.userName };

      if (changingKeyValue) {
        key.value = keyValue;
        key = await encryption.encryptKey(key);
      }

      await repositories.key.update(key);

      if (originalKeyName !== key.keyName) {
        await repositories.appEnvironment.updateKey(key);
      }

      return res.status(200).send({ location: '/key/all' });
    }
    catch (err) {
      if (repositories.isDuplicate(err)) {
        res.status(200).send({error: 'The key name you have specified is already in use'});
      }
      else {
        logger.error(err);
        res.sendStatus(500);
      }
    }
  });

  router.get('/all', isAuthorizedTo(createAKey), async (req, res, next) => {
    try {
      const keys = await repositories.key.findAll();
      let selectedKeyId = undefined;

      if (req.query.keyId) {
        selectedKeyId = req.query.keyId;
      }

      let viewData = {
        keys,
        selectedKeyId
      };

      return await res.renderView({ view: 'keys/keys', viewData });
    }
    catch (err) {
      next(err);
    }
  });

  return router;
};

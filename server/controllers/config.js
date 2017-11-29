const express = require('express');

const noCache = require('../lib/middleware/no-cache');
const tokenVerification = require('../lib/middleware/token-verification');
const models = require('../models');
const configuration = require('../domain/configuration');
const getRequestIp = require('../lib/utils/get-request-ip');
const logger = require('../lib/logger');
const configAuthorization = require('../lib/utils/config-authorization');

module.exports = (config, repositories, encryption) => {
  
  const tokenVerificationInstance = tokenVerification(repositories);
  const configurationInstance = configuration(repositories, encryption);
  const configAuthorizationInstance = configAuthorization(config, encryption);
  const router = express.Router();
  
  router.use(noCache);

  router.head('/', isAuthorizedToGetAccessToken, async (req, res) => {
    try {
      const token = await repositories.token.add(new models.token());
      res.set('x-access-token', token.accessToken);
      res.sendStatus(200);
    }
    catch (err) {
      res.sendStatus(500);
      logger.error(err);
    }
  });

  router.head('/:appId/:environment/:appVersion', async (req, res) => {

    res.set('Content-Type', 'application/json; charset=utf-8');

    try {

      const versionHash = req.headers['x_version_hash'];

      if (!versionHash || versionHash.trim().length === 0) {
        return res.sendStatus(400);
      }

      const appId = req.params.appId;
      const environment = req.params.environment;
      const appVersion = req.params.appVersion;

      const configuration = await configurationInstance.get(appId, environment, appVersion);
      
      if (typeof configuration === 'number') {
        return res.sendStatus(configuration);
      }

      const result = await configAuthorizationInstance.isAuthorized(configuration, req, 'head');

      if (result !== 0) {
        return res.sendStatus(result);
      }

      if (configuration.configurationHash === versionHash) {
        return res.sendStatus(204);
      }

      return res.sendStatus(200);
    }
    catch (err) {
      res.sendStatus(500);
      logger.error(err);
    }
  });

  router.get('/:appId/:environment/:appVersion', tokenVerificationInstance, async (req, res) => {

    res.set('Content-Type', 'application/json; charset=utf-8');

    try {
      const appId = req.params.appId;
      const environment = req.params.environment;
      const appVersion = req.params.appVersion;

      const configuration = await configurationInstance.get(appId, environment, appVersion);
      
      if (typeof configuration === 'number') {
        return res.sendStatus(configuration);
      }

      const result = await configAuthorizationInstance.isAuthorized(configuration, req, 'get');

      if (result !== 0) {
        return res.sendStatus(result);
      }

      let configRetrieval = new models.configRetrieval({
        configurationId: configuration.configurationId,
        appId,
        environment,
        ip: getRequestIp(req)
      });
      
      await repositories.configRetrieval.add(configRetrieval);

      configuration.configuration.forEach((item) => {
        if (Array.isArray(item.value)) {
          return;
        }

        item.value = [ item.value ];
      });

      delete configuration.published;
      delete configuration.publishedBy;
      delete configuration.updated;
      delete configuration.updatedBy;
      delete configuration.comment;
      delete configuration.hasSecureItems;

      await encryption.encryptConfigurationWithKey(configuration);
      delete configuration.key;

      return res.status(200).send(configuration).end();
    }
    catch (err) {
      res.sendStatus(500);
      logger.error(err);
    }
  });

  async function isAuthorizedToGetAccessToken(req, res, next) {
    const result = await configAuthorizationInstance.isAuthorized({
      key: {
        value: config.HMACAuthorizationKey
      },
      keyEncrypted: false
    }, req, 'head');

    if (result !== 0) {
      return res.sendStatus(result);
    }

    next();
  }

  return router;
};


const uuid = require('uuid').v4;
const express = require('express');
const passport = require('passport');
const constants = require('../lib/constants');
const models = require('../models');
const noCache = require('../lib/middleware/no-cache');
const ensureAuthenticated = require('../lib/middleware/ensure-authenticated');
const hasher = require('../lib/hashers/hmac-sha256');
const logger = require('../lib/logger');
const isAuthorizedTo = require('../lib/middleware/is-authorized-to');
const ldap = require('../lib/ldap');
const authorization = require('../domain/authorization');

module.exports = (config, repositories, encryption) => {

  const ensureAuthenticatedInstance = ensureAuthenticated(repositories);
  const { createAUser, changeSettings } = authorization(repositories);
  const ldapInstance = ldap(encryption);
  const router = express.Router();

  router.use(noCache);

  router.get('/', ensureAuthenticatedInstance, async (req, res, next) => {
    try {
      res.redirect('/team');
    }
    catch (err) {
      next(err);
    }
  });

  router.get('/favicon.ico', function(req, res) {
    res.sendStatus(204);
  });

  router.get('/createAdminUser', async (req, res, next) => {

    try {
      const user = await repositories.user.findByUserName('admin');

      if (!user || user.isNull()) {
        return await res.renderView({ view: 'createAdminUser' });
      }
      else {
        return res.redirect('/');
      }
    }
    catch (err) {
      return next(err);
    }
  });

  router.post('/createAdminUser', async (req, res) => {

    res.set('Content-Type', 'application/json; charset=utf-8');

    try {
      let user = await repositories.user.findByUserName('admin');

      if (!user.isNull()) {
        return res.status(200).send({ location: '/login' });
      }

      let body = req.body || {};

      user = new models.user({
        userId: constants.adminUserId,
        userName: 'admin',
        password: body.password,
        enabled: true,
        roles: ['administrator']
      });
        
      if (!user.isValid()) {
        return res.sendStatus(400);
      }

      user.password = await hasher.hash(user.password, config.configEncryptionKey);
      await repositories.user.add(user);
      return res.status(200).send({ location: '/login' });
    }
    catch (err) {
      res.sendStatus(500);
      logger.error(err);
    }
  });

  router.get('/settings', ensureAuthenticatedInstance, isAuthorizedTo(changeSettings), async (req, res, next) => {
    try {
      const settings = await repositories.settings.find();

      const viewData = {
        settings: {}
      };

      if (settings !== undefined && !settings.isNull()) {
        settings.ldapManagerEncryptedPasswordValue = settings.ldapManagerPassword;
        settings.ldapManagerPassword = await encryption.decrypt(settings.ldapManagerPassword);
        settings.ldapManagerEncryptedPassword = true;
        settings.ldapManagerPassword = ''.padEnd(settings.ldapManagerPassword.length, '*');
        viewData.settings = settings;
      }
      else {
        settings.ldapManagerEncryptedPassword = false;
        settings.ldapManagerEncryptedPasswordValue = '';
      }

      return await res.renderView({ view: 'settings', viewData });
    }
    catch (err) {
      return next(err);
    }
  });

  router.post('/settings', ensureAuthenticatedInstance, isAuthorizedTo(changeSettings), async (req, res) => {

    res.set('Content-Type', 'application/json; charset=utf-8');

    try {
      let settings = await repositories.settings.find();

      let body = req.body || {};
      let newSettings = false;

      if (settings.isNull()) {
        newSettings = true;
        settings = new models.settings({
          settingsId: uuid(),
          ldapEnabled: body.ldapEnabled !== undefined && (body.ldapEnabled === 'true' || body.ldapEnabled === true),
          ldapUri: body.ldapUri,
          ldapManagerDn: body.ldapManagerDn,
          ldapManagerPassword: body.ldapManagerPassword,
          ldapSearchBase: body.ldapSearchBase,
          ldapSearchFilter: body.ldapSearchFilter
        });
      }
      else {
        settings.ldapEnabled = body.ldapEnabled !== undefined && (body.ldapEnabled === 'true' || body.ldapEnabled === true);
        settings.ldapUri = body.ldapUri;
        settings.ldapManagerDn = body.ldapManagerDn;
        settings.ldapManagerPassword = body.ldapManagerPassword;
        settings.ldapSearchBase = body.ldapSearchBase;
        settings.ldapSearchFilter = body.ldapSearchFilter;
      }

      if (!settings.isValid()) {
        return res.sendStatus(400);
      }

      if (!(body.ldapManagerEncryptedPassword === true || body.ldapManagerEncryptedPassword === 'true')) {
        settings.ldapManagerPassword = await encryption.encrypt(settings.ldapManagerPassword);
      }

      if (newSettings === true) {
        await repositories.settings.add(settings);
      }
      else {
        await repositories.settings.update(settings);
      }

      return res.status(200).send({ location: '/' });
    }
    catch (err) {
      res.sendStatus(500);
      logger.error(err);
    }
  });

  router.post('/validate-ldap', ensureAuthenticatedInstance, isAuthorizedTo(changeSettings), async (req, res) => {
    res.set('Content-Type', 'application/json; charset=utf-8');

    try {
      let body = req.body || {};

      let settings = {
        ldapUri: body.ldapUri,
        ldapManagerDn: body.ldapManagerDn,
        ldapManagerPassword: body.ldapManagerPassword
      };

      if (body.ldapManagerEncryptedPassword === true || body.ldapManagerEncryptedPassword === 'true') {
        settings.ldapManagerPassword = await encryption.decrypt(settings.ldapManagerPassword);
      }

      await ldapInstance.validate(settings);

      return res.sendStatus(200);
    }
    catch (err) {
      res.sendStatus(500);
      logger.error(err);
    }
  });

  router.post('/ldap-search', ensureAuthenticatedInstance, isAuthorizedTo(createAUser), async (req, res) => {
    res.set('Content-Type', 'application/json; charset=utf-8');

    try {
      let body = req.body || {};

      let settings = await repositories.settings.find();
      let entries = [];
      
      if (!settings.isNull() && settings.ldapEnabled === true) {
        entries = await ldapInstance.search(settings, body.userName, false);
      }

      for (let i = 0; i < entries.length; i++) {
        let entry = entries[i];
        entry.encryptedObjectGUID = await encryption.encrypt(entry.objectGUID);
        entry.encryptedUserName = await encryption.encrypt(entry.userName);
        entry.encryptedObjectGUID = encryption.base64Encode(entry.encryptedObjectGUID);
        entry.encryptedUserName = encryption.base64Encode(entry.encryptedUserName);
      }

      return res.status(200).send(entries);
    }
    catch (err) {
      res.sendStatus(500);
      logger.error(err);
    }
  });

  router.get('/login', async (req, res, next) => {

    try {
      let error = '';

      if (req.session && req.session.flash && req.session.flash.error && req.session.flash.error.length) {
        error = req.session.flash.error[req.session.flash.error.length - 1];
        req.session.flash.error = [];
      }

      let viewData = {
        error: error,
        showError: error.length > 0
      };

      return await res.renderView({view: 'login', viewData});
    }
    catch (err) {
      return next(err);
    }
  });

  router.post('/login', passport.authenticate('local', { successReturnToOrRedirect: "/", successRedirect: '/', failureRedirect: '/login', failureFlash: true }));

  router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  return router;
};

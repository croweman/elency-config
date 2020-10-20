const uuid = require('uuid').v4;
const express = require('express');
const passport = require('passport');
const moment = require('moment');
const crypto = require('crypto');
const base32 = require('thirty-two');
const QRCode = require('qrcode');
const hotp = require('notp').hotp;
const constants = require('../lib/constants');
const models = require('../models');
const noCache = require('../lib/middleware/no-cache');
const ensureAuthenticated = require('../lib/middleware/ensure-authenticated');
const hasher = require('../lib/hashers/hmac-sha256');
const logger = require('../lib/logger');
const isAuthorizedTo = require('../lib/middleware/is-authorized-to');
const ldap = require('../lib/ldap');
const authorization = require('../domain/authorization');
const domain = require('../domain');

module.exports = (config, repositories, encryption) => {

  const ensureAuthenticatedInstance = ensureAuthenticated(repositories);
  const { createAUser, updateAUser, changeSettings } = authorization(repositories);
  const ldapInstance = ldap(encryption);
  const domainInstance = domain(repositories, encryption);
  const router = express.Router();

  router.use(noCache);

  router.get('/', ensureAuthenticatedInstance, async (req, res, next) => {
      try {
        const favouriteApps = [];
        const favouriteTeams = [];

        req.user.favourites.apps.forEach((app) => {
          favouriteApps.push({
            appId: app.appId,
            appName: app.appName,
            url: `/team/${app.teamId}/app/${app.appId}`
          });
        });

        req.user.favourites.teams.forEach((team) => {
          favouriteTeams.push({
            teamId: team.teamId,
            teamName: team.teamName,
            url: `/team/${team.teamId}`
          });
        });

        favouriteApps.sort(compare('appName'));
        favouriteTeams.sort(compare('teamName'));

        const viewData = {
          favouriteApps,
          favouriteTeams
        };

        return await res.renderView({ view: 'home', viewData });
      }
      catch (err) {
        return next(err);
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
        roles: [constants.roleIds.administrator]
      });
        
      if (!user.isValid()) {
        return res.sendStatus(400);
      }

      user.password = user.getHashedPassword(hasher, user.password, config.configEncryptionKey);
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
      }
      else {
        settings.ldapManagerEncryptedPassword = false;
        settings.ldapManagerEncryptedPasswordValue = '';
      }

      settings.updated = moment(settings.updated).format('DD/MM/YYYY HH:mm:ss');

      viewData.settings = settings;
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

      if (body.ldapManagerEncryptedPassword === '') {
        settings.ldapManagerPassword = await encryption.encrypt(settings.ldapManagerPassword);
      }
      else {
        settings.ldapManagerPassword = body.ldapManagerEncryptedPassword;
      }

      settings.updated = new Date();
      settings.updatedBy = { userId: req.user.userId, userName: req.user.userName };

      if (newSettings === true) {
        await repositories.settings.add(settings);
        await domainInstance.audit.addEntry(req.user, constants.actions.createSettings, {});
      }
      else {
        await repositories.settings.update(settings);
        await domainInstance.audit.addEntry(req.user, constants.actions.updateSettings, {});
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
      if (req.isAuthenticated()) {
        return res.redirect('/')
      }

      let error = '';

      if (req.session && req.session.flash && req.session.flash.error && req.session.flash.error.length) {
        error = req.session.flash.error[req.session.flash.error.length - 1];
        req.session.flash.error = [];
      }

      let viewData = {
        error: error,
        showError: error.length > 0
      };

      return await res.renderView({view: 'Login', viewData});
    }
    catch (err) {
      return next(err);
    }
  });

  router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    function(req, res) {
      if (req.user.twoFactorAuthenticationEnabled) {
        if(req.user.secret) {
          req.session.method = 'totp';
          return res.redirect('/totp-input');
        } else {
          req.session.method = 'plain';
          return res.redirect('/totp-setup');
        }
      } else {
        return res.redirect('/');
      }
    }
  );

  router.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy(function(err) {});
    res.clearCookie('elencyConfig');
    return res.redirect('/');
  });

  router.get('/totp-input', isLoggedIn, async function(req, res) {
      if(!req.user.secret) {
          //console.log("Logic error, totp-input requested with no secret set");
          return res.redirect('/login');
      }
      
      const viewData = {
        user: req.user
      };

      return await res.renderView({view: 'totpInput', viewData});
  });

  router.post('/totp-input', isLoggedIn, passport.authenticate('totp', {
      failureRedirect: '/login'
  }), function(req, res) {
    req.session.twoFactorAuthenticated = true;
    return res.redirect('/');
  });

  router.get('/totp-setup', 
      ensureAuthenticatedInstance,
      async function(req, res) {
          req.session.method = 'totp';

          var recoveryCodesExist = true;

          var recoveryCodes = req.user.recoveryCodes;

          if (!recoveryCodes) {
            recoveryCodesExist = false;
            recoveryCodes = generateRecoveryCodes(req.user);
          }

          const bytes = crypto.randomBytes(16);
          var secret = new Buffer.from(bytes).toString();
          secret = base32.encode(secret);
          // Discard equal signs (part of base32, not required by Google Authenticator)
          // Base32 encoding is required by Google Authenticator. 
          // Other applications may place other restrictions on the shared key format.
          secret = secret.toString().replace(/=/g, '');
          req.user.secret = secret;

          let encryptedSecret = await encryption.encrypt(secret);
          
          if (recoveryCodesExist) {
            await repositories.user.update({ userId: req.user.userId, secret: encryptedSecret });  
          } else {
            let encryptedRecoveryCodes = await encryption.encrypt(JSON.stringify(recoveryCodes));
            await repositories.user.update({ userId: req.user.userId, secret: encryptedSecret, recoveryCodes: encryptedRecoveryCodes });
          }
          
          //var qrData = `otpauth://totp/elency-config:${req.user.userName}?secret=${req.user.secret}`; 
          var qrData = `otpauth://totp/elency-config (${req.user.userName})?secret=${req.user.secret}`; 

          QRCode.toDataURL(qrData, async function (err, url) {
            let viewData = {
              user: req.user,
              qrUrl: url,
              recoveryCodesExist: recoveryCodesExist,
              recoveryCodes: recoveryCodes 
            };

            return await res.renderView({view: 'totpSetup', viewData});
          });
      }
  );

  router.get('/totp-reset', 
      isLoggedIn,
      async function(req, res) {
        let viewData = {
          user: req.user
        };

        return await res.renderView({view: 'totpReset', viewData});
      }
  );

  router.post('/totp-reset', 
      isLoggedIn,
      async function(req, res) {
        try {
          if (!req.body.code || req.body.code.length !== 6)
            return res.status(200).send({ error: 'The recovery code is not valid'});

          if (!req.user.recoveryCodes)
            return res.status(200).send({error: 'The user has no recovery codes'});

          let recoveryCodes = await encryption.decrypt(req.user.recoveryCodes);
          recoveryCodes = JSON.parse(recoveryCodes);
          
          let index = recoveryCodes.indexOf(req.body.code)
        
          if (index !== -1) {
            recoveryCodes.splice(index, 1);
            let encryptedRecoveryCodes = await encryption.encrypt(JSON.stringify(recoveryCodes));

            await repositories.user.update({ userId: req.user.userId, secret: undefined, recoveryCodes: encryptedRecoveryCodes });
            req.session.twoFactorAuthenticated = false;

            return res.status(200).send({ location: '/login' });
          }
        
          return res.status(200).send({error: 'The user account has not been reset possibly because you have no more recovery codes.  Seek administrator support.'});
        } catch (err) {
          res.sendStatus(500);
          logger.error(err);
        }
      }
  );

  router.post('/totp-destroy/user/:userId', 
      isAuthorizedTo(updateAUser),
      async function(req, res) {
        let user;

        if (!req.params.userId) {
          return res.sendStatus(400);
        }

        try {
          user = await domainInstance.dataRetrieval.getUser(req.params.userId);
          user.updated = new Date();
          user.updatedBy = { userId: req.user.userId, userName: req.user.userName };
          user.secret = undefined;
          user.recoveryCodes = undefined;
          await repositories.user.update(user);
          await domainInstance.audit.addEntry(req.user, constants.actions.updateUser, { userId: user.userId, userName: user.userName });
          return res.sendStatus(200);
        }
        catch (err) {
          return res.sendStatus(500);
        }
      }
  );


  function compare(propertyName) {
    return function(a, b) {
      if (a[propertyName].toLowerCase() < b[propertyName].toLowerCase())
        return -1;
      if (a[propertyName].toLowerCase() > b[propertyName].toLowerCase())
        return 1;
      return 0;
    }
  }

  function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        next();
    } else {
        return res.redirect('/login');
    }
  }

  function generateRecoveryCodes(user) {
    var recoveryCodes = [];
    var counters = [];
    var key = user.salt;

    while (counters.length < 3) {
      var counter = Math.floor(Math.random() * 10000) + 1;

      if (counters.indexOf(counter) === -1)
        counters.push(counter);
    }

    counters.forEach(function(counter) {
      recoveryCodes.push(hotp.gen(key, { counter: counter }));
    });

    return recoveryCodes;
  }

  return router;
};

const express = require('express');
const passport = require('passport');

const noCache = require('../lib/middleware/no-cache');
const ensureAuthenticated = require('../lib/middleware/ensure-authenticated');
const isAuthorizedTo = require('../lib/middleware/is-authorized-to');
const authorization = require('../domain/authorization');

const models = require('../models');
const hasher = require('../lib/hashers/hmac-sha256');
const domain = require('../domain');
const logger = require('../lib/logger');

module.exports = (config, repositories, encryption) => {

  const ensureAuthenticatedInstance = ensureAuthenticated(repositories);
  const domainInstance = domain(repositories);

  const {
    createAUser,
    updateAUser,
    changeAPassword
  } = authorization(repositories);

  const router = express.Router();

  router.use(noCache);
  router.use(ensureAuthenticatedInstance);

  router.get('/:userId/change-password', isAuthorizedTo(changeAPassword), async (req, res, next) => {

    try {
      const user = await domainInstance.dataRetrieval.getUser(req.params.userId);

      if (req.user.userName === 'admin' && user.userName === 'admin') {
        return await res.renderUnauthorized();
      }

      let viewData = {
        selectedUser: user,
        changingSelf: (req.user.userId === user.userId).toString()
      };

      return await res.renderView({view: 'users/change-password', viewData});
    }
    catch (err) {
      next(err);
    }
  });

  router.post('/:userId/change-password', isAuthorizedTo(changeAPassword), async (req, res) => {
    res.set('Content-Type', 'application/json; charset=utf-8');

    try {
      let body = req.body || {};
      const user = await domainInstance.dataRetrieval.getUser(req.params.userId);

      if (req.user.userName === 'admin' && user.userName === 'admin') {
        return res.sendStatus(401);
      }

      user.password = body.password.trim();

      if (!user.isValid()) {
        return res.sendStatus(400);
      }

      user.password = hasher.hashSync(user.password, config.configEncryptionKey);
      user.updated = new Date();
      user.updatedBy = { userId: req.user.userId, userName: req.user.userName };

      await repositories.user.update(user);
      return res.status(200).send({});
    }
    catch (err) {
      res.sendStatus(500);
      logger.error(err);
    }
  });
  
  router.get('/create', isAuthorizedTo(createAUser), async (req, res, next) => {

    try {
      let teamsAndApps = await domainInstance.user.getTeamsAndApps();
      let viewData = {
        teams: teamsAndApps,
        LDAPUserName: req.query.username || '',
        LDAPUserId: req.query.userid || ''
      };

      if (viewData.LDAPUserName.length > 0) {
        viewData.LDAPUserName = encryption.base64Decode(viewData.LDAPUserName);
        viewData.LDAPUserId = encryption.base64Decode(viewData.LDAPUserId);
        viewData.LDAPUserName = await encryption.decrypt(viewData.LDAPUserName);
        viewData.LDAPUserId = await encryption.decrypt(viewData.LDAPUserId);
      }
      
      return await res.renderView({view: 'users/create', viewData});
    }
    catch (err) {
      next(err);
    }
  });

  router.post('/create', isAuthorizedTo(createAUser), async (req, res) => {
    res.set('Content-Type', 'application/json; charset=utf-8');

    try {
      let body = req.body || {};
      let permissions = getPermissions(body);
      body.teamPermissions = permissions.teamPermissions;
      body.appConfigurationPermissions = permissions.appConfigurationPermissions;

      const user = new models.user(body);

      if (!user.isValid()) {
        return res.sendStatus(400);
      }

      if (body.ldapEnabled === true || body.ldapEnabled === 'true') {
        user.userId = body.userId;
      }
      
      user.updated = new Date();
      user.updatedBy = { userId: req.user.userId, userName: req.user.userName };
      user.password = hasher.hashSync(user.password, config.configEncryptionKey);
      await repositories.user.add(user);
      return res.status(200).send({ location: '/user/all' });
    }
    catch (err) {
      if (repositories.isDuplicate(err)) {
        res.status(200).send({error: 'The user id or name you have specified is already in use'});
      }
      else {
        logger.error(err);
        res.sendStatus(500);
      }
    }
  });

  router.get('/:userId/update', isAuthorizedTo(updateAUser), async (req, res, next) => {

    let user;

    if (!req.params.userId) {
      return await res.renderError();
    }

    try {
      user = await domainInstance.dataRetrieval.getUser(req.params.userId);
    }
    catch (err) {
      return next(err);
    }

    let teamsAndApps = await domainInstance.user.getTeamsAndApps(user);
    
    let viewData = {
      selectedUser: user,
      teams: teamsAndApps,
      userId: user.userId
    };

    return await res.renderView({ view: 'users/update', viewData });
  });

  router.post('/:userId/update', isAuthorizedTo(updateAUser), async (req, res) => {
    res.set('Content-Type', 'application/json; charset=utf-8');

    try {
      let body = req.body || {};
      const enabled = body.enabled.toString() === 'true';
      const roles = body.roles || [];

      let permissions = getPermissions(body);
      let teamPermissions = permissions.teamPermissions;
      let appConfigurationPermissions = permissions.appConfigurationPermissions;

      const user = await domainInstance.dataRetrieval.getUser(req.params.userId);
      user.enabled = enabled;
      user.roles = roles;
      user.teamPermissions = teamPermissions;
      user.appConfigurationPermissions = appConfigurationPermissions;
      user.updated = new Date();
      user.updatedBy = { userId: req.user.userId, userName: req.user.userName };
      await repositories.user.update(user);
      return res.status(200).send({ location: '/user/all' });
    }
    catch (err) {
      res.sendStatus(500);
      logger.error(err);
    }
  });

  router.get('/all', isAuthorizedTo(createAUser), async (req, res, next) => {
    try {
      const users = await repositories.user.findAll();

      let index = users.findIndex((item) => {
        return item.userId === req.user.userId
      });

      if (index !== -1) {
        let user = users[index];
        users.splice(index, 1);
        users.unshift(user);
      }

      let selectedUserId = undefined;

      if (req.query.userId) {
        selectedUserId = req.query.userId;
      }

      let viewData = {
        users,
        selectedUserId
      };

      return await res.renderView({view: 'users/users', viewData});
    }
    catch (err) {
      next(err);
    }
  });

  function getPermissions(body) {
    const teamPermissions = [];
    const appConfigurationPermissions = [];

    body.teamPermissions = body.teamPermissions || [];
    body.appConfigurationPermissions = body.appConfigurationPermissions || [];

    body.teamPermissions.forEach((id) => {
      teamPermissions.push(new models.teamPermission({
        id: id,
        write: true
      }))
    });

    Object.keys(body.appConfigurationPermissions).forEach((appId) => {
      Object.keys(body.appConfigurationPermissions[appId]).forEach((environment) => {

        var environmentPermissions = body.appConfigurationPermissions[appId][environment];
        var model = new models.appConfigurationPermission({
          id: appId,
          environment,
          read: (environmentPermissions.read && environmentPermissions.read.toString() === 'true') === true,
          write: (environmentPermissions.write && environmentPermissions.write.toString() === 'true') === true,
          publish: (environmentPermissions.publish && environmentPermissions.publish.toString() === 'true') === true,
          delete: (environmentPermissions.delete && environmentPermissions.delete.toString() === 'true') === true
        });
        appConfigurationPermissions.push(model);

      });
    });

    return {
      teamPermissions,
      appConfigurationPermissions
    };
  }
  
  return router;
};

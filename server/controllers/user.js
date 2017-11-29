const express = require('express');
const moment = require('moment');

const noCache = require('../lib/middleware/no-cache');
const ensureAuthenticated = require('../lib/middleware/ensure-authenticated');
const isAuthorizedTo = require('../lib/middleware/is-authorized-to');
const authorization = require('../domain/authorization');
const { getPermissions } = require('../domain/permissions');

const models = require('../models');
const hasher = require('../lib/hashers/hmac-sha256');
const domain = require('../domain');
const logger = require('../lib/logger');
const constants = require('../lib/constants');

module.exports = (config, repositories, encryption) => {

  const ensureAuthenticatedInstance = ensureAuthenticated(repositories);
  const domainInstance = domain(repositories);
  const AuditPageSize = 10;

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

      if (req.user.userName === 'admin') {
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

      if (req.user.userName === 'admin') {
        return res.sendStatus(401);
      }

      user.password = body.password.trim();

      if (!user.isValid()) {
        return res.sendStatus(400);
      }

      user.password = user.getHashedPassword(hasher, user.password, config.configEncryptionKey);
      user.updated = new Date();
      user.updatedBy = { userId: req.user.userId, userName: req.user.userName };

      await repositories.user.update(user);
      await domainInstance.audit.addEntry(req.user, constants.actions.updateUserPassword, { userId: user.userId, userName: user.userName });
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
      let availableRoles = await domainInstance.user.getAllRoles();

      availableRoles.forEach((role) => {
        delete role.selected;
      });

      let viewData = {
        teams: teamsAndApps.teams,
        apps: teamsAndApps.apps,
        LDAPUserName: req.query.username || '',
        LDAPUserId: req.query.userid || '',
        availableRoles
      };

      if (viewData.LDAPUserName.length > 0) {
        viewData.LDAPUserName = encryption.base64Decode(viewData.LDAPUserName);
        viewData.LDAPUserId = encryption.base64Decode(viewData.LDAPUserId);
        viewData.LDAPUserName = await encryption.decrypt(viewData.LDAPUserName);
        viewData.LDAPUserId = await encryption.decrypt(viewData.LDAPUserId);
      }

      viewData.available = domainInstance.user.getPermissionsData(teamsAndApps);

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
      user.password = user.getHashedPassword(hasher, user.password, config.configEncryptionKey);
      await repositories.user.add(user);
      await domainInstance.audit.addEntry(req.user, constants.actions.createUser, { userId: user.userId, userName: user.userName });
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

  router.get('/audit', isAuthorizedTo(createAUser), async (req, res, next) => {

    let users = [];

    try {
      users = await repositories.user.findAll({ includeAdmin: true });
    }
    catch (err) {
      return next(err);
    }

    const actionTypes = Object.keys(constants.actions)
      .map(key => constants.actions[key]);
    actionTypes.sort();

    let viewData = {
      pageSize: AuditPageSize,
      url: `/user/audit-data`,
      actionTypes,
      users
    };

    return await res.renderView({ view: 'users/audit', viewData });
  });
  
  router.get('/audit-data', isAuthorizedTo(createAUser), async (req, res, next) => {
    res.set('Content-Type', 'application/json; charset=utf-8');
    
    let action = req.query.action || '';
    let userId = req.query.userId || '';
    let pageNumber = req.query.pageNumber || 1;
    let forceCount = req.query.forceCount !== undefined;

    if (isNaN(parseInt(pageNumber))) {
      return res.status(400).send({ html: '' });
    }

    const filters = {};
    if (action) {
      filters.action = action;
    }
    if (userId) {
      filters.userId = userId;
    }

    try {
      let count;

      if (forceCount) {
        count = await repositories.audit.count(filters);
      }
      
      pageNumber = parseInt(pageNumber);
      let skip = (pageNumber * AuditPageSize) - AuditPageSize;
      const auditHistory = await repositories.audit.find(filters, { skip, limit: AuditPageSize });

      let html = '';

      auditHistory.forEach((audit) => {
        html += '<tr><td>' + audit.action + '</td><td><pre>' + JSON.stringify(audit.data, null, 2) + '</pre></td><td>' + moment(audit.changed).format('DD/MM/YYYY HH:mm:ss') + '</td><td><a href="/user/all?userId=' + audit.changedBy.userId + '">' + audit.changedBy.userName + '</a></td></tr>';
      });

      return res.status(200).send({ count, html });
    }
    catch (err) {
      console.log(err)
      return res.status(200).send({ html: '' });
    }
  });

  router.get('/:userId/update', isAuthorizedTo(updateAUser), async (req, res, next) => {

    let user;

    if (!req.params.userId) {
      return await res.renderError();
    }

    try {
      user = await domainInstance.dataRetrieval.getUser(req.params.userId);
      user.updated = moment(user.updated).format('DD/MM/YYYY HH:mm:ss');
    }
    catch (err) {
      return next(err);
    }

    let teamsAndApps = await domainInstance.user.getTeamsAndApps(user);
    let availableRoles = await domainInstance.user.getAllRoles(user);
    
    let selectedRoles = availableRoles.filter(role => role.selected === true);

    availableRoles.forEach((role) => {
      delete role.selected;
    });

    let viewData = {
      selectedUser: user,
      teams: teamsAndApps.teams,
      apps: teamsAndApps.apps,
      userId: user.userId,
      availableRoles,
      selectedRoles
    };

    viewData.available = domainInstance.user.getPermissionsData(teamsAndApps);

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
      await domainInstance.audit.addEntry(req.user, constants.actions.updateUser, { userId: user.userId, userName: user.userName });
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

  router.post('/favourite', async (req, res) => {

    res.set('Content-Type', 'application/json; charset=utf-8');

    if (!req.body || !req.body.type || !req.body.action || !req.body.ids || !Array.isArray(req.body.ids) || !req.body.name) {
      return res.sendStatus(400);
    }

    try {
      const user = await domainInstance.dataRetrieval.getUser(req.user.userId);
      let array = user.favourites.apps;
      let idProperties = [ 'appId', 'teamId'];
      let nameProperty = 'appName';
      
      if (req.body.type === 'team') {
        array = user.favourites.teams;
        idProperties = [ 'teamId' ];
        nameProperty = 'teamName';
      }
      
      const favourite = array.find(item => item[idProperties.slice(0, 1)] === req.body.ids[0]);

      if (req.body.action === 'add') {
        if (!favourite) {
          let obj = {};
          for (let i = 0; i < idProperties.length; i++) {
            obj[idProperties[i]] = req.body.ids[i];
          }
          obj[nameProperty] = req.body.name;
          array.push(obj);
        }
      }
      else {
        if (favourite !== undefined) {
          const index = array.indexOf(favourite);
          array.splice(index, 1);
        }
      }

      await repositories.user.update(user);
      return res.status(200).send({});
    }
    catch (err) {
      res.sendStatus(500);
      logger.error(err);
    }
  });
  
  return router;
};

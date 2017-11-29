const express = require('express');
const moment = require('moment');

const noCache = require('../lib/middleware/no-cache');
const ensureAuthenticated = require('../lib/middleware/ensure-authenticated');
const isAuthorizedTo = require('../lib/middleware/is-authorized-to');
const authorization = require('../domain/authorization');
const { getPermissions } = require('../domain/permissions');

const models = require('../models');
const domain = require('../domain');
const logger = require('../lib/logger');
const constants = require('../lib/constants');

module.exports = (config, repositories, encryption) => {

  const ensureAuthenticatedInstance = ensureAuthenticated(repositories);
  const domainInstance = domain(repositories);

  const {
    createARole,
    updateARole
  } = authorization(repositories);

  const router = express.Router();

  router.use(noCache);
  router.use(ensureAuthenticatedInstance);
  
  router.get('/create', isAuthorizedTo(createARole), async (req, res, next) => {

    try {
      let teamsAndApps = await domainInstance.user.getTeamsAndApps();
      let viewData = {
        teams: teamsAndApps.teams,
        apps: teamsAndApps.apps
      };

      viewData.available = domainInstance.user.getPermissionsData(teamsAndApps);

      return await res.renderView({view: 'roles/create', viewData});
    }
    catch (err) {
      next(err);
    }
  });

  router.post('/create', isAuthorizedTo(createARole), async (req, res) => {
    res.set('Content-Type', 'application/json; charset=utf-8');

    try {
      let body = req.body || {};
      let permissions = getPermissions(body);
      body.teamPermissions = permissions.teamPermissions;
      body.appConfigurationPermissions = permissions.appConfigurationPermissions;

      const role = new models.role(body);

      if (!role.isValid()) {
        return res.sendStatus(400);
      }

      role.updated = new Date();
      role.updatedBy = { userId: req.user.userId, userName: req.user.userName };
      await repositories.role.add(role);
      await domainInstance.audit.addEntry(req.user, constants.actions.createRole, { roleId: role.roleId, roleName: role.roleName });
      return res.status(200).send({ location: '/role/all' });
    }
    catch (err) {
      if (repositories.isDuplicate(err)) {
        res.status(200).send({error: 'The role id or name you have specified is already in use'});
      }
      else {
        logger.error(err);
        res.sendStatus(500);
      }
    }
  });

  router.get('/:roleId/update', isAuthorizedTo(updateARole), async (req, res, next) => {

    let role;

    if (!req.params.roleId) {
      return await res.renderError();
    }

    try {
      role = await domainInstance.dataRetrieval.getRole(req.params.roleId);
      role.updated = moment(role.updated).format('DD/MM/YYYY HH:mm:ss');
    }
    catch (err) {
      return next(err);
    }

    let teamsAndApps = await domainInstance.user.getTeamsAndApps(role);
    
    let viewData = {
      selectedRole: role,
      teams: teamsAndApps.teams,
      apps: teamsAndApps.apps,
      roleId: role.roleId
    };

    viewData.available = domainInstance.user.getPermissionsData(teamsAndApps);
    
    return await res.renderView({ view: 'roles/update', viewData });
  });

  router.post('/:roleId/update', isAuthorizedTo(updateARole), async (req, res) => {
    res.set('Content-Type', 'application/json; charset=utf-8');

    try {
      let body = req.body || {};

      let permissions = getPermissions(body);
      let teamPermissions = permissions.teamPermissions;
      let appConfigurationPermissions = permissions.appConfigurationPermissions;

      const role = await domainInstance.dataRetrieval.getRole(req.params.roleId);
      role.roleName = body.roleName;

      if (!role.isValid()) {
          return res.sendStatus(400);
      }

      role.teamPermissions = teamPermissions;
      role.appConfigurationPermissions = appConfigurationPermissions;
      role.updated = new Date();
      role.updatedBy = { userId: req.user.userId, userName: req.user.userName };
      await repositories.role.update(role);
      await domainInstance.audit.addEntry(req.user, constants.actions.updateRole, { roleId: role.roleId, roleName: role.roleName });
      return res.status(200).send({ location: '/role/all' });
    }
    catch (err) {
      if (repositories.isDuplicate(err)) {
        res.status(200).send({error: 'The role name you have specified is already in use'});
      }
      else {
        logger.error(err);
        res.sendStatus(500);
      }
    }
  });

  router.get('/all', isAuthorizedTo(createARole), async (req, res, next) => {
    try {
      const availableRoles = await repositories.role.findAll();

      let viewData = {
        availableRoles
      };

      return await res.renderView({view: 'roles/roles', viewData});
    }
    catch (err) {
      next(err);
    }
  });
  
  return router;
};

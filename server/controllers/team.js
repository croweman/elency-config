const express = require('express');
const passport = require('passport');

const noCache = require('../lib/middleware/no-cache');
const ensureAuthenticated = require('../lib/middleware/ensure-authenticated');
const isAuthorizedTo = require('../lib/middleware/is-authorized-to');
const authorization = require('../domain/authorization');

const models = require('../models');
const uuid = require('uuid').v4;
const versionSorter = require('../lib/utils/version-sorter');
const moment = require('moment');
const logger = require('../lib/logger');
const aes256cbc = require('../lib/encryptors/aes-256-cbc');
const domain = require('../domain');
const diff = require('diff');
const constants = require('../lib/constants');

module.exports = (config, repositories, encryption) => {

  const ensureAuthenticatedInstance = ensureAuthenticated(repositories);
  const domainInstance = domain(repositories, encryption);
  const dataRetrieval = domainInstance.dataRetrieval;

  const {
    createATeam,
    updateATeam,
    createAnApp,
    updateAnApp,
    readAnApp,
    createAnAppEnvironment,
    updateAnAppEnvironment,
    createAConfiguration,
    updateAConfiguration,
    readAConfiguration,
    publishAConfiguration,
    deleteAConfiguration
  } = authorization(repositories);

  const router = express.Router();

  router.use(noCache);
  router.use(ensureAuthenticatedInstance);

  router.get('/', async (req, res, next) => {
    try {
      const teams = await repositories.team.findAll();
      return await res.renderView({ view: 'teams/teams', viewData: { teams } });
    }
    catch (err) {
      next(err);
    }
  });

  router.get('/create', isAuthorizedTo(createATeam), async (req, res, next) => {
    try {
      return await res.renderView({ view: 'teams/create' });
    }
    catch (err) {
      next(err);
    }
  });

  router.post('/create', isAuthorizedTo(createATeam), async (req, res) => {
    res.set('Content-Type', 'application/json; charset=utf-8');

    let body = req.body || {};
    const team = new models.team(body);

    if (!team.isValid()) {
      return res.sendStatus(400);
    }

    team.updated = new Date();
    team.updatedBy = { userId: req.user.userId, userName: req.user.userName };

    try {
      await repositories.team.add(team);
      await domainInstance.audit.addEntry(req.user, constants.actions.createTeam, { teamId: team.teamId, teamName: team.teamName });
      return res.status(200).send({location: '/team'});
    }
    catch (err) {
      if (repositories.isDuplicate(err)) {
        res.status(200).send({error: 'The team id or name you have specified is already in use'});
      }
      else {
        logger.error(err);
        res.sendStatus(500);
      }
    }
  });

  router.get('/:teamId/update', isAuthorizedTo(updateATeam), async (req, res, next) => {

    try {
      const team = await dataRetrieval.getTeam(req.params.teamId);
      const viewData = { team };
      viewData.team.updated = moment(team.updated).format('DD/MM/YYYY HH:mm:ss');
      return await res.renderView({ view: 'teams/update', viewData });
    }
    catch (err) {
      next(err);
    }
  });

  router.post('/:teamId/update', isAuthorizedTo(updateATeam), async (req, res) => {
    res.set('Content-Type', 'application/json; charset=utf-8');

    let body = req.body || {};

    try {
      let team = await dataRetrieval.getTeam(req.params.teamId);
      let originalTeamName = team.teamName;
      team.teamName = body.teamName || '';
      team.description = body.description || '';

      if (!team.isValid()) {
        return res.sendStatus(400);
      }

      team.updated = new Date();
      team.updatedBy = { userId: req.user.userId, userName: req.user.userName };

      await repositories.team.update(team);

      if (team.teamName !== originalTeamName) {
        await repositories.app.updateTeam(team);
        await repositories.appEnvironment.updateTeam(team);
        await repositories.configuration.updateTeam(team);
        await repositories.user.updateTeamNameInFavourites(team);
      }

      await domainInstance.audit.addEntry(req.user, constants.actions.updateTeam, { teamId: team.teamId, teamName: team.teamName });

      return res.status(200).send({ location: '/team' });
    }
    catch (err) {
      if (repositories.isDuplicate(err)) {
        res.status(200).send({error: 'The team name you have specified is already in use'});
      }
      else {
        logger.error(err);
        res.sendStatus(500);
      }
    }
  });

  router.get('/:teamId', async (req, res, next) => {

    try {
      const team = await dataRetrieval.getTeam(req.params.teamId);
      const viewData = { team };
      viewData.team.apps = await repositories.app.findByTeam(team.teamId);
      viewData.favourite = req.user.favourites.teams.find(item => item.teamId === team.teamId) ? 'active' : '';
      viewData.team.updated = moment(team.updated).format('DD/MM/YYYY HH:mm:ss');
      return res.renderView({ view: 'teams/team', viewData });
    }
    catch (err) {
      next(err);
    }
  });

  router.get('/:teamId/app/create', isAuthorizedTo(createAnApp), async (req, res, next) => {

    try {
      const team = await dataRetrieval.getTeam(req.params.teamId);
      const viewData = { team };
      return await res.renderView({view: 'apps/create', viewData});
    }
    catch (err) {
      next(err);
    }
  });

  router.post('/:teamId/app/create', isAuthorizedTo(createAnApp), async (req, res) => {
    res.set('Content-Type', 'application/json; charset=utf-8');

    let body = req.body || {};

    try {
      const team = await dataRetrieval.getTeam(req.params.teamId);
      body.teamId = team.teamId;
      body.teamName = team.teamName;
      const app = new models.app(body);

      if (!app.isValid()) {
        return res.sendStatus(400);
      }

      app.updated = new Date();
      app.updatedBy = { userId: req.user.userId, userName: req.user.userName };

      await repositories.app.add(app);
      await domainInstance.audit.addEntry(req.user, constants.actions.createApp, { teamId: app.teamId, teamName: app.teamName, appId: app.appId, appName: app.appName });
      return res.status(200).send({ location: `/team/${team.teamId}` });
    }
    catch (err) {
      if (repositories.isDuplicate(err)) {
        res.status(200).send({error: 'The app id or name you have specified is already in use'});
      }
      else {
        logger.error(err);
        res.sendStatus(500);
      }
    }
  });

  router.get('/:teamId/app/:appId/update', isAuthorizedTo(updateAnApp), async (req, res, next) => {
    try {

      const app = await dataRetrieval.getApp(req.params.appId);
      const teams = await repositories.team.findAll();
      const viewData = {
        app,
        teams
      };
      viewData.app.updated = moment(app.updated).format('DD/MM/YYYY HH:mm:ss');
      return await res.renderView({ view: 'apps/update', viewData });
    }
    catch (err) {
      next(err);
    }
  });

  router.post('/:teamId/app/:appId/update', isAuthorizedTo(updateAnApp), async (req, res) => {
    res.set('Content-Type', 'application/json; charset=utf-8');

    let body = req.body || {};

    try {
      let app = await dataRetrieval.getApp(req.params.appId);
      let originalTeamId = app.teamId;
      let originalAppName = app.appName;
      app.appName = body.appName;
      app.description = body.description;
      app.teamId = body.teamId;

      if (!app.isValid()) {
        return res.sendStatus(400);
      }

      let team = await dataRetrieval.getTeam(app.teamId);

      let canMoveApp = await createAnApp(req.user, { teamId: team.teamId });

      if (!canMoveApp) {
        return res.status(200).send({error: `You are not authorized to create apps under the selected team '${team.teamName}'` });
      }

      app.teamId = team.teamId;
      app.teamName = team.teamName;
      app.updated = new Date();
      app.updatedBy = { userId: req.user.userId, userName: req.user.userName };

      await repositories.app.update(app);

      if (app.appName !== originalAppName) {
        await repositories.appEnvironment.updateApp(app);
        await repositories.configuration.updateApp(app);
        await repositories.user.updateAppNameInFavourites(app);
      }

      if (app.teamId !== originalTeamId) {
        await repositories.appEnvironment.updateAppTeam(app, originalTeamId, team);
        await repositories.configuration.updateAppTeam(app, originalTeamId, team);
      }

      await domainInstance.audit.addEntry(req.user, constants.actions.updateApp, { teamId: app.teamId, teamName: app.teamName, appId: app.appId, appName: app.appName });
      return res.status(200).send({ location: `/team/${req.params.teamId}` });
    }
    catch (err) {
      if (repositories.isDuplicate(err)) {
        res.status(200).send({error: 'The app name you have specified is already in use'});
      }
      else {
        logger.error(err);
        res.sendStatus(500);
      }
    }
  });

  router.get('/:teamId/app/:appId', async (req, res, next) => {

    try {
      const app = await dataRetrieval.getApp(req.params.appId);
      const viewData = { app };
      viewData.appEnvironments = await repositories.appEnvironment.findAll(app.appId);
      viewData.favourite = req.user.favourites.apps.find(item => item.appId === app.appId) ? 'active' : '';
      viewData.app.updated = moment(app.updated).format('DD/MM/YYYY HH:mm:ss');
      viewData.canWrite = await await updateAnAppEnvironment(req.user, req.params);
      return await res.renderView({ view: 'apps/app', viewData });
    }
    catch (err) {
      next(err);
    }
  });

  router.get('/:teamId/app/:appId/environment/create', isAuthorizedTo(createAnAppEnvironment), async (req, res, next) => {

    try {
      const app = await dataRetrieval.getApp(req.params.appId);
      const viewData = { app };
      viewData.keys = await repositories.key.findAll();
      return await res.renderView({ view: 'apps/environment-create', viewData });
    }
    catch (err) {
      next(err);
    }
  });

  router.post('/:teamId/app/:appId/environment/create', isAuthorizedTo(createAnAppEnvironment), async (req, res) => {
    res.set('Content-Type', 'application/json; charset=utf-8');

    try {
      let body = req.body || {};
      const app = await dataRetrieval.getApp(req.params.appId);
      const key = await dataRetrieval.getKey(body.keyId);
      let environment = req.body.environment.trim();

      const appEnvironment = new models.appEnvironment({
        teamId: app.teamId,
        teamName: app.teamName,
        appId: app.appId,
        appName: app.appName,
        keyId: key.keyId,
        keyName: key.keyName,
        versions: [],
        environment
      });

      if (!appEnvironment.isValid()) {
        return res.sendStatus(400);
      }

      appEnvironment.updated = new Date();
      appEnvironment.updatedBy = { userId: req.user.userId, userName: req.user.userName };

      await repositories.appEnvironment.add(appEnvironment);
      await domainInstance.audit.addEntry(req.user, constants.actions.createAppEnvironment, { teamId: appEnvironment.teamId, teamName: appEnvironment.teamName, appId: appEnvironment.appId, appName: appEnvironment.appName, environment: appEnvironment.environment, keyId: appEnvironment.keyId });
      return res.status(200).send({ location: `/team/${app.teamId}/app/${app.appId}` });
    }
    catch (err) {
      if (repositories.isDuplicate(err)) {
        res.status(200).send({error: 'The environment you have specified is already in use'});
      }
      else {
        logger.error(err);
        res.sendStatus(500);
      }
    }
  });

  router.get('/:teamId/app/:appId/environment/:environment/update', isAuthorizedTo(updateAnAppEnvironment), async (req, res, next) => {

    try {
      const appEnvironment = await dataRetrieval.getAppEnvironment(req.params.appId, req.params.environment);
      const viewData = {
        appEnvironment
      };
      viewData.keys = await repositories.key.findAll();
      viewData.appEnvironment.updated = moment(appEnvironment.updated).format('DD/MM/YYYY HH:mm:ss');
      return await res.renderView({ view: 'apps/environment-update', viewData });
    }
    catch (err) {
      next(err);
    }
  });

  router.post('/:teamId/app/:appId/environment/:environment/update', isAuthorizedTo(updateAnAppEnvironment), async (req, res) => {
    res.set('Content-Type', 'application/json; charset=utf-8');

    try {
      let body = req.body || {};
      const originalEnvironment = req.params.environment;
      const appEnvironment = await dataRetrieval.getAppEnvironment(req.params.appId, originalEnvironment);
      const key = await dataRetrieval.getKey(body.keyId);

      appEnvironment.environment = body.environment;
      appEnvironment.keyId = key.keyId;
      appEnvironment.keyName = key.keyName;

      if (!appEnvironment.isValid()) {
        return res.sendStatus(400);
      }

      appEnvironment.updated = new Date();
      appEnvironment.updatedBy = { userId: req.user.userId, userName: req.user.userName };

      await repositories.appEnvironment.update(originalEnvironment, appEnvironment);

      if (appEnvironment.environment !== originalEnvironment) {
        await repositories.user.updateEnvironment(originalEnvironment, appEnvironment);
        await repositories.role.updateEnvironment(originalEnvironment, appEnvironment);
        await repositories.configuration.updateEnvironment(originalEnvironment, appEnvironment);
      }

      await domainInstance.audit.addEntry(req.user, constants.actions.updateAppEnvironment, { teamId: appEnvironment.teamId, teamName: appEnvironment.teamName, appId: appEnvironment.appId, appName: appEnvironment.appName, environment: appEnvironment.environment, keyId: appEnvironment.keyId });
      return res.status(200).send({ location: `/team/${appEnvironment.teamId}/app/${appEnvironment.appId}` });
    }
    catch (err) {
      if (repositories.isDuplicate(err)) {
        res.status(200).send({error: 'The environment you have specified is already in use'});
      }
      else {
        logger.error(err);
        res.sendStatus(500);
      }
    }
  });

  async function getDifferences(configurationA, configurationB) {

    const keys = [];

    configurationA.configuration.forEach((entry) => {
      keys.push(entry.key);
    });

    configurationB.configuration.forEach((entry) => {
      if (keys.indexOf(entry.key) === -1) {
        keys.push(entry.key);
      }
    });

    keys.sort();
    keys.unshift('{elencyConfig.configuration.appVersion}');

    function getEntryFromConfiguration(configuration, key) {
      return configuration.configuration.find((entry) => { return entry.key === key; });
    }

    let html = '<div class="breaker"></div><div class="comparison"><h2>Comparison differences</h2><div class="breaker"></div>';
    let results = [];

    keys.forEach((key) => {

      let a;
      let b;
      let aValue;
      let bValue;

      if (key === '{elencyConfig.configuration.appVersion}') {
        key = 'Configuration version';
        a = {};
        b = {};
        aValue = configurationA.appVersion;
        bValue = configurationB.appVersion;
      }
      else {
        a = getEntryFromConfiguration(configurationA, key);
        b = getEntryFromConfiguration(configurationB, key);

        if (a !== undefined) {
          aValue = (a.encrypted === true ? a.value[1] : a.value);
        }

        if (b !== undefined) {
          bValue = (b.encrypted === true ? b.value[1] : b.value);
        }
      }

      if (a !== undefined && b !== undefined) {

        let markup = '';
        let added = 0;
        let removed = 0;

        diff.diffChars(aValue, bValue).forEach(function(part){
          if (part.added === true) {
            added += part.count;
          }

          if (part.removed === true) {
            removed += part.count;
          }

          color = part.added ? 'added' : part.removed ? 'removed' : 'nochange';
          markup += `<code class=${color}>${part.value}</code>`;
        });

        results.push({
          key,
          state: 'diff',
          added,
          removed,
          value: markup
        });
      }
      else if (a !== undefined) {
        results.push({
          key,
          state: 'added',
          value: aValue
        });
      }
      else {
        results.push({
          key,
          state: 'removed',
          value: bValue
        });
      }
    });

    results.forEach((result) => {

      let className = 'diff';

      if (result.state === 'diff') {

        html += `<div><strong>${result.key}</strong>: (${result.added} added, ${result.removed} removed)</div>`;
      }
      else {
        html += `<div><strong>${result.key}</strong>: (${result.state === 'added' ? 'added' : 'removed'})</div>`;
      }

      if (result.state === 'added') {
        className = 'added';
      }
      else if (result.state === 'removed') {
        className = 'removed';
      }

      html += `<pre class="${className}">${result.value}</pre>`;
    });

    html += '</div>';
    return html;
  }

  router.get('/:teamId/app/:appId/environment/:environment/configuration/compare', isAuthorizedTo(readAnApp), async (req, res, next) => {

    try {
      const appEnvironment = await dataRetrieval.getAppEnvironment(req.params.appId, req.params.environment);
      const configurations = await repositories.configuration.findAll({ appId: req.params.appId, environment: req.params.environment });

      const viewData = {
        appEnvironment,
        configurations: [],
        configurationIdOne: '',
        configurationIdTwo: ''
      };

      const allVersions = [];

      configurations.forEach((configuration) => {
        if (allVersions.indexOf(configuration.appVersion) !== -1) {
          return;
        }

        allVersions.push(configuration.appVersion);
      });

      versionSorter(allVersions, true);

      for (let i = 0; i < allVersions.length; i++) {
        const version = allVersions[i];

        for (let j = 0; j < configurations.length; j++) {
          let configuration = configurations[j];

          if (configuration.appVersion !== version) {
            continue;
          }

          viewData.configurations.push(`${configuration.appVersion}:${configuration.configurationId}:${configuration.hasSecureItems === true}`);
        };
      }

      if (req.query.configurationIdOne !== undefined && req.query.configurationIdOne.trim().length > 0) {
        let configuration = configurations.find((item) => { return item.configurationId === req.query.configurationIdOne.trim(); });

        if (configuration !== undefined) {
          viewData.configurationIdOne = `${configuration.appVersion} - ${configuration.configurationId}`;
        }
      }

      if (req.query.configurationIdTwo !== undefined && req.query.configurationIdTwo.trim().length > 0) {
        let configuration = configurations.find((item) => { return item.configurationId === req.query.configurationIdTwo.trim(); });

        if (configuration !== undefined) {
          viewData.configurationIdTwo = `${configuration.appVersion} - ${configuration.configurationId}`;
        }
      }

      return await res.renderView({ view: 'apps/compare', viewData });
    }
    catch (err) {
      next(err);
    }
  });

  router.post('/:teamId/app/:appId/environment/:environment/configuration/compare', isAuthorizedTo(readAnApp), async (req, res, next) => {

    try {
      let body = req.body || {};
      const appEnvironment = await dataRetrieval.getAppEnvironment(req.params.appId, req.params.environment);
      const configurations = await repositories.configuration.findAll({ appId: req.params.appId, environment: req.params.environment });
      let configurationA;
      let configurationB;

      let keyValue = body.keyValue;

      if (keyValue !== undefined) {
        if (keyValue.trim().length !== 32) {
          return res.sendStatus(400);
        }

        if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(keyValue)) {
          return res.sendStatus(400);
        }

        let key = await dataRetrieval.getKey(appEnvironment.keyId);
        key = await encryption.decryptKey(key);

        if (keyValue !== key.value) {
          return res.sendStatus(500);
        }
      }

      if (body.configurationIdOne !== undefined && body.configurationIdOne.trim().length > 0) {
        configurationA = configurations.find((item) => { return item.configurationId === body.configurationIdOne.trim(); });

        if(configurationA !== undefined) {
          configurationA = await dataRetrieval.getConfiguration(configurationA.configurationId);
        }
      }

      if (body.configurationIdTwo !== undefined && body.configurationIdTwo.trim().length > 0) {
        configurationB = configurations.find((item) => { return item.configurationId === body.configurationIdTwo.trim(); });

        if(configurationB !== undefined) {
          configurationB = await dataRetrieval.getConfiguration(configurationB.configurationId);
        }
      }

      if (configurationA !== undefined && !configurationA.isNull() &&
        configurationB !== undefined && !configurationB.isNull()) {

        configurationA = await encryption.decryptConfiguration(configurationA);
        configurationB = await encryption.decryptConfiguration(configurationB);

        if (keyValue !== undefined) {
          await decryptConfigurationEntries(configurationA);
          await decryptConfigurationEntries(configurationB);
        }

        const differencesMarkup = await getDifferences(configurationA, configurationB);
        return res.status(200).send(differencesMarkup);
      }

      return res.sendStatus(500);
    }
    catch (err) {
      next(err);
    }
  });

  router.get('/:teamId/app/:appId/environment/:environment/configuration/retrieval', isAuthorizedTo(readAConfiguration), async (req, res, next) => {

    try {
      const appEnvironment = await dataRetrieval.getAppEnvironment(req.params.appId, req.params.environment);
      const viewData = { appEnvironment };

      return await res.renderView({ view: 'apps/configuration-retrieval', viewData });
    }
    catch (err) {
      next(err);
    }
  });

  router.post('/:teamId/app/:appId/environment/:environment/configuration/retrieval', isAuthorizedTo(readAConfiguration), async (req, res, next) => {
    res.set('Content-Type', 'application/json; charset=utf-8');

    try {
      let body = req.body || {};
      let applicationVersion = body.applicationVersion;

      if (applicationVersion === undefined || !/^[\d]{1,}.[\d]{1,}.[\d]{1,}$/.test(applicationVersion)) {
        return res.sendStatus(400);
      }

      const appEnvironment = await dataRetrieval.getAppEnvironment(req.params.appId, req.params.environment);;
      let configuration = await domainInstance.configuration.getViaAppEnvironment(appEnvironment, applicationVersion);

      let result = {};

      if (typeof configuration !== 'number') {
        result = {
          version: configuration.appVersion,
          configurationId: configuration.configurationId,
          updated: moment(configuration.updated).format('DD/MM/YYYY HH:mm:ss'),
          url: `/team/${appEnvironment.teamId}/app/${appEnvironment.appId}/environment/${appEnvironment.environment}/version/${configuration.appVersion}?configurationId=${configuration.configurationId}`,
          updatedBy: {
            userName: configuration.updatedBy.userName,
            url: `/user/all?userId=${configuration.updatedBy.userId}`
          },
          publishedBy: {
            userName: configuration.publishedBy.userName,
            url: `/user/all?userId=${configuration.publishedBy.userId}`
          },
          comment: configuration.comment
        };
      }

      return res.status(200).send(result).end();
    }
    catch (err) {
      logger.error(err);
      return res.sendStatus(500);
    }
  });

  router.get('/:teamId/app/:appId/environment/:environment/configuration/create', isAuthorizedTo(createAConfiguration), async (req, res, next) => {
    await getCreateConfiguration(req, res, next);
  });

  router.post('/:teamId/app/:appId/environment/:environment/configuration/create', isAuthorizedTo(createAConfiguration), async (req, res) => {
    await postCreateConfiguration(req, res);
  });

  router.get('/:teamId/app/:appId/environment/:environment/configuration/:configurationId/update', isAuthorizedTo(updateAConfiguration), async (req, res, next) => {
    await getCreateConfiguration(req, res, next);
  });

  router.post('/:teamId/app/:appId/environment/:environment/configuration/:configurationId/update', isAuthorizedTo(updateAConfiguration), async (req, res) => {
    await postCreateConfiguration(req, res);
  });

  router.post('/:teamId/app/:appId/environment/:environment/version/:version/configuration/:configurationId/publish', isAuthorizedTo(publishAConfiguration), async (req, res) => {
    res.set('Content-Type', 'application/json; charset=utf-8');

    try {
      const configuration = await dataRetrieval.getConfiguration(req.params.configurationId);
      const appEnvironment = await dataRetrieval.getAppEnvironment(req.params.appId, req.params.environment);

      configuration.published = true;
      configuration.updated = new Date();
      configuration.publishedBy = {
        userId: req.user.userId,
        userName: req.user.userName
      };

      await repositories.configuration.update(configuration);

      if (appEnvironment.versions.indexOf(configuration.appVersion) === -1) {
        appEnvironment.versions.push(configuration.appVersion);
        appEnvironment.versions = versionSorter(appEnvironment.versions, true);
        await repositories.appEnvironment.update(appEnvironment.environment, appEnvironment);
      }

      await domainInstance.audit.addEntry(req.user, constants.actions.publishConfiguration, { configurationId: configuration.configurationId, teamId: configuration.teamId, appId: configuration.appId, appName: configuration.appName, environment: configuration.environment, keyId: configuration.key.keyId, appVersion: configuration.appVersion });

      return res.status(200).send({ location: `/team/${configuration.teamId}/app/${configuration.appId}/environment/${appEnvironment.environment}/version/${configuration.appVersion}?configurationId=${configuration.configurationId}` });
    }
    catch (err) {
      res.sendStatus(500);
      logger.error(err);
    }
  });

  router.post('/:teamId/app/:appId/environment/:environment/version/:version/configuration/:configurationId/decrypt', isAuthorizedTo(readAConfiguration), async (req, res, next) => {
    res.set('Content-Type', 'text/html; charset=utf-8');

    try {
      let body = req.body || {};
      let keyValue = body.keyValue;

      if (keyValue === undefined || keyValue.trim().length !== 32) {
        return res.sendStatus(400);
      }

      if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(keyValue.trim())) {
        return res.sendStatus(400);
      }

      const configuration = await dataRetrieval.getConfiguration(req.params.configurationId);
      const viewData = { configuration };

      viewData.configuration = await encryption.decryptConfiguration(viewData.configuration);

      for (let i = 0; i < viewData.configuration.configuration.length; i++)
      {
        if (!viewData.configuration.configuration[i].encrypted) {
          continue;
        }

        viewData.configuration.configuration[i].value = await aes256cbc.decrypt(viewData.configuration.configuration[i].value, keyValue);
        viewData.configuration.configuration[i].decrypted = true;
      }

      if (req.query && req.query.json && req.query.json === 'true') {
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.json(viewData.configuration.configuration);
      }
      else {
        return await res.renderView({view: 'apps/decrypted-entries', viewData});
      }
    }
    catch (err) {
      next(err);
    }
  });

  router.post('/:teamId/app/:appId/environment/:environment/version/:version/configuration/:configurationId/delete', isAuthorizedTo(deleteAConfiguration), async (req, res, next) => {
    res.set('Content-Type', 'text/html; charset=utf-8');

    try {
      const configuration = await dataRetrieval.getConfiguration(req.params.configurationId);

      if (configuration.published === true) {
        res.status(200).send({ error: 'The configuration cannot be deleted as it is published' });
      }

      await repositories.configuration.remove(configuration);
      await domainInstance.audit.addEntry(req.user, constants.actions.deleteConfiguration, { configurationId: configuration.configurationId, teamId: configuration.teamId, appId: configuration.appId, appName: configuration.appName, environment: configuration.environment, keyId: configuration.key.keyId, appVersion: configuration.appVersion });
      return res.status(200).send({ location: `/team/${configuration.teamId}/app/${configuration.appId}/environment/${configuration.environment}/version/${configuration.appVersion}` });
    }
    catch (err) {
      res.sendStatus(500);
      logger.error(err);
    }
  });

  router.get('/:teamId/app/:appId/environment/:environment/version/:version/configuration/:configurationId', isAuthorizedTo(readAConfiguration), async (req, res, next) => {

    try {
      const configurationId = req.params.configurationId;
      const configuration = await dataRetrieval.getConfiguration(configurationId);
      const viewData = { configuration };

      viewData.configuration = await encryption.decryptConfiguration(viewData.configuration);
      viewData.configuration.updated = moment(viewData.configuration.updated).format('DD/MM/YYYY HH:mm:ss');
      viewData.hasSecureItem = (viewData.configuration.configuration.find((item) => { return item.encrypted === true }) !== undefined);
      viewData.configuration.configuration.forEach((item) => {
        item.decryped = false;
      });

      if (configuration.published === true) {
        viewData.retrievals = await repositories.configRetrieval.count(configurationId);
        viewData.lastRetrieved = '';
        const retrieval = await repositories.configRetrieval.last(configurationId);

        if (retrieval && retrieval.retrieved) {
          viewData.lastRetrieved = moment(retrieval.retrieved).format('DD/MM/YYYY HH:mm:ss');
        }
      }

      return await res.renderView({ view: 'apps/configuration', viewData });
    }
    catch (err) {
      next(err);
    }
  });

  router.get('/:teamId/app/:appId/environment/:environment/version/:version', isAuthorizedTo(readAConfiguration), async (req, res, next) => {

    try {
      const appEnvironment = await dataRetrieval.getAppEnvironment(req.params.appId, req.params.environment);
      const viewData = {
        appEnvironment,
        version: req.params.version,
        selectedConfigurationId: (req.query && req.query.configurationId ? req.query.configurationId : '')
      };

      viewData.revisions = await repositories.configuration.findAllByVersion({
        appId: viewData.appEnvironment.appId,
        environment: viewData.appEnvironment.environment,
        appVersion: viewData.version
      });

      viewData.revisions.forEach((revision) => {
        revision.updated = moment(revision.updated).format('DD/MM/YYYY HH:mm:ss');
      });

      return await res.renderView({ view: 'apps/version-revisions', viewData });
    }
    catch (err) {
      next(err);
    }
  });

  router.get('/:teamId/app/:appId/environment/:environment', isAuthorizedTo(readAnApp), async (req, res, next) => {

    try {
      const appEnvironment = await dataRetrieval.getAppEnvironment(req.params.appId, req.params.environment);
      const viewData = { appEnvironment };
      versionSorter(viewData.appEnvironment.versions, true);
      viewData.appEnvironment.updated = moment(appEnvironment.updated).format('DD/MM/YYYY HH:mm:ss');
      return await res.renderView({ view: 'apps/environment', viewData });
    }
    catch (err) {
      next(err);
    }
  });

  async function getCreateConfiguration(req, res, next) {
    try {
      const appEnvironment = await dataRetrieval.getAppEnvironment(req.params.appId, req.params.environment);
      let version = req.query && req.query.version ? req.query.version : '';
      let configurationEntries = [];
      let preload = false;
      let initialEntries = 0;
      let createFrom = '';
      let updating = false;
      let comment = '';
      let currentCount = 0;

      if (req.query && req.query.createFrom) {
        createFrom = req.query.createFrom;
      }

      if (req.params.configurationId) {
        createFrom = req.params.configurationId;
        updating = true;
      }

      let configuration = {};

      if (createFrom.length > 0) {
        configuration =  await dataRetrieval.getConfiguration(createFrom);

        if (!updating && (configuration.appId != req.params.appId || configuration.environment !== req.params.environment)) {
          throw 'You are not allowed to copy the configuration';
        }

        if (updating === true && configuration.published === true) {
          throw 'You cannot edit a published configuration';
        }

        version = configuration.appVersion;
        comment = configuration.comment;
        const decryptedConfiguration = await encryption.decryptConfiguration(configuration);
        configurationEntries = decryptedConfiguration.configuration;
        preload = true;
        initialEntries = configurationEntries.length;
        createFrom = configuration.configurationId;
        configuration.updated = moment(configuration.updated).format('DD/MM/YYYY HH:mm:ss')
      }

      const viewData = {
        appEnvironment,
        version: version,
        configurationEntries: configurationEntries,
        preload,
        initialEntries,
        createFrom,
        updating,
        configuration,
        comment,
        currentCount: configurationEntries.length
      };

      viewData.hasSecureItem = (viewData.configurationEntries.find((item) => { return item.encrypted === true }) !== undefined);

      return await res.renderView({ view: 'apps/configuration-create', viewData });
    }
    catch (err) {
      next(err);
    }
  }

  async function postCreateConfiguration(req, res) {
    res.set('Content-Type', 'application/json; charset=utf-8');

    try {
      const appEnvironment = await dataRetrieval.getAppEnvironment(req.params.appId, req.params.environment);
      let body = req.body || {};

      if (!req.body || !req.body.version) {
        return res.sendStatus(400);
      }
      const version = body.version !== undefined ? body.version.trim() : '';
      const comment = body.comment !== undefined ? body.comment.trim() : '';
      const configurationEntries = (body.configurationEntries || []);

      let exceptions = [];
      let originalConfiguration;
      const configurationKeys = [];
      let createFrom = '';
      let updating = false;

      if (req.query && req.query.createFrom) {
        createFrom = req.query.createFrom;
      }

      if (req.params.configurationId) {
        createFrom = req.params.configurationId;
        updating = true;
      }

      if (createFrom.length > 0) {
        const configuration = await dataRetrieval.getConfiguration(createFrom);
        originalConfiguration = configuration;
        originalConfiguration = await encryption.decryptConfiguration(originalConfiguration);

        if (!updating && (originalConfiguration.appId != req.params.appId || originalConfiguration.environment !== req.params.environment)) {
          throw 'You are not allowed to copy the configuration';
        }

        if (updating === true && originalConfiguration.published === true) {
          throw 'You cannot edit a published configuration';
        }
      }

      for (let i = 0; i < configurationEntries.length; i++) {
        const configurationKey = new models.configurationKey(configurationEntries[i]);

        if (!configurationKey.isValid()) {
          return res.sendStatus(400);
        }

        if (configurationKeys.find((item) => { return item.key === configurationKey.key }) !== undefined) {
          throw 'duplicate key defined';
        }

        if (configurationEntries[i].alreadyEncrypted !== undefined && (configurationEntries[i].alreadyEncrypted === true || configurationEntries[i].alreadyEncrypted === 'true')) {
          exceptions.push(configurationKey.key);
        }

        if (originalConfiguration !== undefined && configurationEntries[i].originalKey !== undefined && configurationEntries[i].originalKey.length > 0) {
          let item = originalConfiguration.configuration.find((item) => { return item.key === configurationEntries[i].originalKey });
          configurationKey.value = item.value;
        }

        configurationKeys.push(configurationKey);
      }

      let hasSecureItems = configurationKeys.find((item) => { return item.encrypted === true; }) !== undefined;

      let configuration;

      if (!updating) {
        configuration = new models.configuration({
          teamId: appEnvironment.teamId,
          teamName: appEnvironment.teamName,
          appId: appEnvironment.appId,
          appName: appEnvironment.appName,
          environment: appEnvironment.environment,
          appVersion: version,
          comment: comment,
          configuration: configurationKeys,
          published: false,
          updated: new Date(),
          updatedBy: {
            userId: req.user.userId,
            userName: req.user.userName
          },
          hasSecureItems
        });
      }
      else {
        configuration = originalConfiguration;
        configuration.appVersion = version;
        configuration.comment = comment;
        configuration.configuration = configurationKeys;
        configuration.updated = new Date();
        configuration.updatedBy = {
          userId: req.user.userId,
          userName: req.user.userName
        };
        configuration.hasSecureItems = hasSecureItems;
      }

      if (!configuration.isValid()) {
        return res.sendStatus(400);
      }

      let key = await dataRetrieval.getKey(appEnvironment.keyId);
      configuration.key = { keyId: key.keyId, value: key.value };

      configuration = await encryption.encryptConfiguration(configuration, exceptions);

      if (updating) {
        await repositories.configuration.update(configuration);
        await domainInstance.audit.addEntry(req.user, constants.actions.updateConfiguration, { teamId: configuration.teamId, teamName: configuration.teamName, appId: configuration.appId, appName: configuration.appName, environment: configuration.environment, keyId: configuration.key.keyId });
      }
      else {
        await repositories.configuration.add(configuration);
        await domainInstance.audit.addEntry(req.user, constants.actions.createConfiguration, { teamId: configuration.teamId, teamName: configuration.teamName, appId: configuration.appId, appName: configuration.appName, environment: configuration.environment, keyId: configuration.key.keyId });
      }

      if (appEnvironment.allVersions.indexOf(version) === -1) {
        appEnvironment.allVersions.push(version);
        appEnvironment.allVersions = versionSorter(appEnvironment.allVersions, true);
        await repositories.appEnvironment.update(appEnvironment.environment, appEnvironment);
      }
      return res.status(200).send({ location: `/team/${req.params.teamId}/app/${appEnvironment.appId}/environment/${configuration.environment}/version/${configuration.appVersion}?configurationId=${configuration.configurationId}` });
    }
    catch (err) {
      res.sendStatus(500);
      logger.error(err);
    }
  }

  async function decryptConfigurationEntries(configuration) {
    let keyValue = await encryption.decryptKey(configuration.key);
    keyValue = keyValue.value;

    for (let i = 0; i < configuration.configuration.length; i++)
    {
      if (!configuration.configuration[i].encrypted) {
        continue;
      }

      configuration.configuration[i].value = await aes256cbc.decrypt(configuration.configuration[i].value, keyValue);
      configuration.configuration[i].encrypted = false;
    }
  }

  return router;
};

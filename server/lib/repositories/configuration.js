const repositoryBase = require('./repository-base');
const model = require('../../models/configuration');

let mongoClient;
let base;

function find(configuration) {

  return base.findOne({
    appId: configuration.appId,
    appVersion: configuration.appVersion,
    environment: configuration.environment,
    published: configuration.published
  }, { 
    sort: {
      updated: -1
    } 
  });
};

function findByConfigurationId(configurationId) {

  return base.findOne({
    configurationId: configurationId,
  });
};

function findAll(configuration) {
  return base.find({
    appId: configuration.appId,
    environment: configuration.environment
  }, {
    sort: {
      updated: -1
    },
    project: {
      configuration: 0,
      key: 0
    }
  });
};

function findAllByVersion(configuration) {
  return base.find({
    appId: configuration.appId,
    environment: configuration.environment,
    appVersion: configuration.appVersion
  }, {
    sort: {
      updated: -1
    },
    project: {
      configuration: 0,
      key: 0
    }
  });
};

function add(configuration) {
  return base.insertOne(configuration);
}

function update(configuration) {
  return base.updateOne({ configurationId: configuration.configurationId }, configuration);
}

function updateTeam(team) {
  return base.updateMany({ teamId: team.teamId }, { $set: { teamName: team.teamName }});
}

function updateApp(app) {
  return base.updateMany({ teamId: app.teamId, appId: app.appId }, { $set: { appName: app.appName }});
}

function remove(configuration) {
  return base.removeOne({ configurationId: configuration.configurationId, published: false });
}

function removeAll() {
  return base.removeMany({});
}

function addIndexes() {
  base.addIndex({ appId: 1, version: 1, environment: 1, published: 1, updated: -1 }, { background: true });
}

module.exports = (mongoClientInstance) => {
  mongoClient = mongoClientInstance;
  base = repositoryBase(mongoClient, 'configuration', model);

  addIndexes();

  return {
    add,
    find,
    findByConfigurationId,
    findAll,
    findAllByVersion,
    update,
    updateApp,
    updateTeam,
    remove,
    removeAll
  };
};
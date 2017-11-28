const repositoryBase = require('./repository-base');
const model = require('../../models/app-environment');

let mongoClient;
let base;

function find(appId, environment) {
  return base.findOne({ appId, environment });
};

function findAll(appId) {
  if (appId) {
    return base.find({appId}, {
      sort: {
        environment: 1
      }
    });
  }

  return base.find({}, {
    sort: {
      appId: 1,
      environment: 1
    }
  });
}

function add(appEnvironment) {
  return base.insertOne(appEnvironment);
}

function update(appEnvironment) {
  return base.updateOne({ appId: appEnvironment.appId, environment: appEnvironment.environment }, appEnvironment);
}

function remove(appEnvironment) {
  return base.removeOne({ appId: appEnvironment.appId, environment: appEnvironment.environment });
}

function removeAll() {
  return base.removeMany({});
}

function updateTeam(team) {
  return base.updateMany({ teamId: team.teamId }, { $set: { teamName: team.teamName }});
}

function updateApp(app) {
  return base.updateMany({ teamId: app.teamId, appId: app.appId }, { $set: { appName: app.appName }});
}

function updateKey(key) {
  return base.updateMany({ keyId: key.keyId }, { $set: { keyName: key.keyName }});
}

function addIndexes() {
  base.addIndex({ appId: 1, environment: 1 }, { unique: true });
  base.addIndex({ teamId: 1 }, { background: true });
  base.addIndex({ keyId: 1 }, { background: true });
}

module.exports = (mongoClientInstance) => {
  mongoClient = mongoClientInstance;
  base = repositoryBase(mongoClient, 'appEnvironment', model);

  addIndexes();

  return {
    add,
    find,
    findAll,
    update,
    updateApp,
    updateKey,
    updateTeam,
    remove,
    removeAll
  };
};
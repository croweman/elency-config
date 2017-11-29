const repositoryBase = require('./repository-base');
const model = require('../../models/app');

let mongoClient;
let base;

function find(appId) {
  return base.findOne({ appId });
};

function findByTeam(teamId) {
  return base.find({ teamId }, {
    sort: {
      appId: 1,
      appName: 1
    }
  });
};

function findAll() {
  return base.find({}, {
    sort: {
      appId: 1,
      appName: 1
    }
  });
}

function add(app) {
  return base.insertOne(app);
}

function addMany(apps) {
  return base.insertMany(apps);
}

function update(app) {
  return base.updateOne({ appId: app.appId }, app);
}

function updateTeam(team) {
  return base.updateMany({ teamId: team.teamId }, { $set: { teamName: team.teamName }});
}

function remove(app) {
  return base.removeOne({ appId: app.appId });
}

function removeAll() {
  return base.removeMany({});
}

function addIndexes() {
  base.addIndex({ appId: 1 }, { unique: true });
  base.addIndex({ appId: 1, teamId: 1 }, { background: true });
  base.addIndex({ appName: 1 }, { unique: true });
}

module.exports = (mongoClientInstance) => {
  mongoClient = mongoClientInstance;
  base = repositoryBase(mongoClient, 'app', model);

  addIndexes();

  return {
    add,
    addMany,
    find,
    findAll,
    findByTeam,
    update,
    updateTeam,
    remove,
    removeAll
  };
};
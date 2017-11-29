const repositoryBase = require('./repository-base');
const model = require('../../models/user');

let mongoClient;
let base;

function find(userId) {
  return base.findOne({ userId });
};

function findByUserName(userName) {
  return base.findOne({ userName });
};

function findAll(options) {
  options = options || {};
  let query = { userName: { $ne: 'admin' } };

  if (options.includeAdmin === true) {
    query = {};
  }

  return base.find(query, {
    sort: {
      enabled: -1,
      userName: 1
    },
    project: {
      teamPermissions: 0,
      appConfigurationPermissions: 0
    }
  });
}

function add(user) {
  return base.insertOne(user);
}

function addMany(users) {
  return base.insertMany(users);
}

function update(user) {
  return base.updateOne({ userId: user.userId }, user);
}

function updateTeamNameInFavourites(team) {
  return base.updateMany({
      "favourites.teams.teamId": team.teamId
    },
    {
      $set: {
        "favourites.teams.$.teamName": team.teamName
      }
    });
}

function updateAppNameInFavourites(app) {
  return base.updateMany({
      "favourites.apps.appId": app.appId
    },
    {
      $set: {
        "favourites.apps.$.appName": app.appName
      }
    });
}

function updateEnvironment(environment, appEnvironment) {
  return base.updateMany({ 
      "appConfigurationPermissions.id": appEnvironment.appId,
      "appConfigurationPermissions.environment": environment
    }, { 
    $set: {
      "appConfigurationPermissions.$.environment": appEnvironment.environment
    }
  });
}

function remove(user) {
  return base.removeOne({ userId: user.userId });
}

function removeAll() {
  return base.removeMany({});
}

function addIndexes() {
  base.addIndex({ userId: 1 }, { unique: true });
  base.addIndex({ userName: 1 }, { unique: true });
  base.addIndex({ "favourites.teams.teamId": 1 }, { unique: false, background: true });
  base.addIndex({ "favourites.apps.appId": 1 }, { unique: false, background: true });
  base.addIndex({ "appConfigurationPermissions.id": 1, "appConfigurationPermissions.environment": 1 }, { unique: false, background: true });
}

module.exports = (mongoClientInstance) => {
  mongoClient = mongoClientInstance;
  base = repositoryBase(mongoClient, 'user', model);

  addIndexes();

  return {
    add,
    addMany,
    find,
    findByUserName,
    findAll,
    update,
    remove,
    removeAll,
    updateTeamNameInFavourites,
    updateAppNameInFavourites,
    updateEnvironment
  };
};
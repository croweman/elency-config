const repositoryBase = require('./repository-base');
const model = require('../../models/role');

let mongoClient;
let base;

function find(roleId) {
  return base.findOne({ roleId });
};

function findByRoleName(roleName) {
  return base.findOne({ roleName });
};

function findByRoleIds(roleIds) {
  "use strict";
  return base.find({
    roleId: {
      $in: roleIds
    }
  }, {
    sort: {
      roleName: 1
    }
  });
}

function findAll() {
  return base.find({}, {
    sort: {
      roleName: 1
    },
    project: {
      teamPermissions: 0,
      appConfigurationPermissions: 0
    }
  });
}

function add(role) {
  return base.insertOne(role);
}

function addMany(roles) {
  return base.insertMany(roles);
}

function update(role) {
  return base.updateOne({ roleId: role.roleId }, role);
}

function remove(role) {
  return base.removeOne({ roleId: role.roleId });
}

function removeAll() {
  return base.removeMany({});
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

function addIndexes() {
  base.addIndex({ roleId: 1 }, { unique: true });
  base.addIndex({ roleName: 1 }, { unique: true });
  base.addIndex({ "appConfigurationPermissions.id": 1, "appConfigurationPermissions.environment": 1 }, { unique: false, background: true });
}

module.exports = (mongoClientInstance) => {
  mongoClient = mongoClientInstance;
  base = repositoryBase(mongoClient, 'role', model);

  addIndexes();

  return {
    add,
    addMany,
    find,
    findByRoleName,
    findByRoleIds,
    findAll,
    update,
    remove,
    removeAll,
    updateEnvironment
  };
};
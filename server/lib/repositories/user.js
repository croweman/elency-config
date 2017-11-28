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

function findAll() {
  return base.find({ userName: { $ne: 'admin' } }, {
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

function update(user) {
  return base.updateOne({ userId: user.userId }, user);
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
}

module.exports = (mongoClientInstance) => {
  mongoClient = mongoClientInstance;
  base = repositoryBase(mongoClient, 'user', model);

  addIndexes();

  return {
    add,
    find,
    findByUserName,
    findAll,
    update,
    remove,
    removeAll
  };
};
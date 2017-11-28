const repositoryBase = require('./repository-base');
const model = require('../../models/key');

let mongoClient;
let base;

function find(keyId) {
  return base.findOne({ keyId });
};

function findAll() {
  return base.find({}, {
    sort: {
      keyName: 1
    }
  });
}

function add(key) {
  return base.insertOne(key);
}

function update(key) {
  return base.updateOne({ keyId: key.keyId }, key);
}

function remove(key) {
  return base.removeOne({ keyId: key.keyId });
}

function removeAll() {
  return base.removeMany({});
}

function addIndexes() {
  base.addIndex({ keyId: 1 }, { unique: true });
  base.addIndex({ keyName: 1 }, { unique: true });
}

module.exports = (mongoClientInstance) => {
  mongoClient = mongoClientInstance;
  base = repositoryBase(mongoClient, 'key', model);

  addIndexes();

  return {
    add,
    find,
    findAll,
    update,
    remove,
    removeAll
  };
};
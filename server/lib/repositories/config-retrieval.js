const repositoryBase = require('./repository-base');
const model = require('../../models/config-retrieval');

let mongoClient;
let base;

function find(appId, environment, published) {
  return base.findOne({ appId, environment, published });
};

function findAll(appId, environment) {
  return base.find({ appId, environment });
}

function add(audit) {
  return base.insertOne(audit);
}

function removeAll() {
  return base.removeMany({});
}

function addIndexes() {
  base.addIndex({ appId: 1, environment: 1 }, { background: true });
}

module.exports = (mongoClientInstance) => {
  mongoClient = mongoClientInstance;
  base = repositoryBase(mongoClient, 'configRetrieval', model);

  addIndexes();

  return {
    add,
    find,
    findAll,
    removeAll
  };
};
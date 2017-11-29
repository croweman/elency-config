const repositoryBase = require('./repository-base');
const model = require('../../models/config-retrieval');

let mongoClient;
let base;

function count(configurationId) {
  return base.count({ configurationId });
}

function last(configurationId) {
  return base.findOne({ configurationId }, {
    sort: {
      retrieved: -1
    }
  });
}

function find(configurationId, pagination) {
  const options = {
    sort: {
      retrieved: -1
    }
  };

  if (pagination && pagination.skip) {
    options.skip = pagination.skip;
  }

  if (pagination && pagination.limit) {
    options.limit = pagination.limit;
  }

  return base.find({ configurationId }, options);
}

function add(configRetrieval) {
  return base.insertOne(configRetrieval);
}

function removeAll() {
  return base.removeMany({});
}

function addIndexes() {
  base.addIndex({ configurationId: 1, retrieved: -1 }, { background: true });
}

module.exports = (mongoClientInstance) => {
  mongoClient = mongoClientInstance;
  base = repositoryBase(mongoClient, 'configRetrieval', model);

  addIndexes();

  return {
    add,
    count,
    find,
    last,
    removeAll
  };
};
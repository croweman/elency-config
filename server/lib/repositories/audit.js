const repositoryBase = require('./repository-base');
const model = require('../../models/audit');

let mongoClient;
let base;

function getQueryOptions(pagination) {
  const options = {
    sort: {
      changed: -1
    }
  };

  if (pagination && pagination.skip) {
    options.skip = pagination.skip;
  }

  if (pagination && pagination.limit) {
    options.limit = pagination.limit;
  }

  return options;
}

function getQuery(filters) {
  filters = filters || {};
  const query = {};

  if (filters.action) {
    query.action = filters.action;
  }

  if (filters.userId) {
    query["changedBy.userId"] = filters.userId;
  }

  return query;
}

function findByAction(action, pagination) {
  const options = getQueryOptions(pagination);
  return base.find({ action }, options);
};

function count(filters) {
  const query = getQuery(filters);
  return base.count(query);
};

function findByUser(userId, pagination) {
  const options = getQueryOptions(pagination);
  return base.find({ "changedBy.userId": userId }, options);
};

function find(filters, pagination) {
  const query = getQuery(filters);
  const options = getQueryOptions(pagination);
  return base.find(query, options);
};

function add(audit) {
  return base.insertOne(audit);
}

function addMany(audits) {
  return base.insertMany(audits);
}

function removeAll() {
  return base.removeMany({});
}

function addIndexes() {
  base.addIndex({ userId: 1, changed: -1 }, { background: true });
  base.addIndex({ action: 1, changed: -1 }, { background: true });
}

module.exports = (mongoClientInstance) => {
  mongoClient = mongoClientInstance;
  base = repositoryBase(mongoClient, 'audit', model);

  addIndexes();

  return {
    add,
    addMany,
    findByAction,
    count,
    findByUser,
    find,
    removeAll
  };
};
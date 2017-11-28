const repositoryBase = require('./repository-base');
const model = require('../../models/token');

let mongoClient;
let base;

function find(accessToken) {
  return base.findOne({ accessToken: accessToken, expires : { $gte: new Date() } });
};

function add(token) {

  return base.insertOne(token);
}

function remove(accessToken) {
  return base.removeOne({ accessToken: accessToken });
}

function removeAll() {
  return base.removeMany({});
}

function addIndexes() {

  base.addIndex({ accessToken: 1, expires: 1 }, { background: true });
  base.addIndex({ expires: 1 }, { expireAfterSeconds: 0 });
}

module.exports = (mongoClientInstance) => {
  mongoClient = mongoClientInstance;
  base = repositoryBase(mongoClient, 'tokens', model);

  addIndexes();

  return {
    add,
    find,
    remove,
    removeAll
  };
};
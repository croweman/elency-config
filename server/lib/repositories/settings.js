const repositoryBase = require('./repository-base');
const model = require('../../models/settings');

let mongoClient;
let base;

function find() {
  return base.findOne({});
};

function add(settings) {
  return base.insertOne(settings);
}

function update(settings) {
  return base.updateOne({ settingsId: settings.settingsId }, settings);
}

function removeAll() {
  return base.removeMany({});
}

function addIndexes() {
  base.addIndex({ settingsId: 1 }, { unique: true });
}

module.exports = (mongoClientInstance) => {
  mongoClient = mongoClientInstance;
  base = repositoryBase(mongoClient, 'settings', model);

  addIndexes();

  return {
    add,
    find,
    removeAll,
    update
  };
};
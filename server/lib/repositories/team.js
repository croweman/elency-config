const repositoryBase = require('./repository-base');
const model = require('../../models/team');

let mongoClient;
let base;

function find(teamId) {
  return base.findOne({ teamId });
};

function findAll() {
  return base.find({}, {
    sort: {
      teamId: 1
    }
  });
}

function add(team) {
  return base.insertOne(team);
}

function addMany(teams) {
  return base.insertMany(teams);
}

function update(team) {
  return base.updateOne({ teamId: team.teamId }, team);
}

function remove(team) {
  return base.removeOne({ teamId: team.teamId });
}

function removeAll() {
  return base.removeMany({});
}

function addIndexes() {
  base.addIndex({ teamId: 1 }, { unique: true });
  base.addIndex({ teamName: 1 }, { unique: true });
}

module.exports = (mongoClientInstance) => {
  mongoClient = mongoClientInstance;
  base = repositoryBase(mongoClient, 'team', model);

  addIndexes();

  return {
    add,
    addMany,
    find,
    findAll,
    update,
    remove,
    removeAll
  };
};
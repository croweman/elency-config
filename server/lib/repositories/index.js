const { MongoClient } = require('mongodb');
const app = require('./app');
const appEnvironment = require('./app-environment');
const audit = require('./audit');
const configuration = require('./configuration');
const configRetrieval = require('./config-retrieval');
const key = require('./key');
const team = require('./team');
const token = require('./token');
const user = require('./user');
const settings = require('./settings');

let mongoClient;

function isDuplicate(err) {
  return (err && (err.toString !== undefined && err.toString().toLowerCase().indexOf('duplicate') !== -1) ||
  (err.code && err.code === 11000));
}

async function createRepositories(elencyConfig) {
  
  const url = elencyConfig.mongoUrl;

  try {
    mongoClient = await MongoClient.connect(url);
  }
  catch (err) {
    throw new Error('An error occurred while trying to connect to the configurated "mongoUrl"');
  }

  const repositories = {
    app: app(mongoClient),
    appEnvironment: appEnvironment(mongoClient),
    audit: audit(mongoClient),
    key: key(mongoClient),
    configuration: configuration(mongoClient),
    configRetrieval: configRetrieval(mongoClient),
    team: team(mongoClient),
    token: token(mongoClient),
    user: user(mongoClient),
    settings: settings(mongoClient),
    isDuplicate
  };

  return repositories
}

module.exports = createRepositories;
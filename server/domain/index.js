const appEnvironment = require('./app-environment');
const audit = require('./audit');
const authorization = require('./authorization');
const configuration = require('./configuration');
const dataRetrieval = require('./data-retrieval');
const user = require('./user');

module.exports = (repositories, encryption) => {
  return {
    appEnvironment: appEnvironment(repositories, encryption),
    audit: audit(repositories),
    authorization,
    configuration: configuration(repositories, encryption),
    dataRetrieval: dataRetrieval(repositories, encryption),
    user: user(repositories)
  };
};
const config = require('./config');
const general = require('./general');
const key = require('./key');
const team = require('./team');
const user = require('./user');

module.exports = (configuration, repositories, encryption) => {
  return {
    config: config(configuration, repositories, encryption),
    general: general(configuration, repositories, encryption),
    key: key(configuration, repositories, encryption),
    team: team(configuration, repositories, encryption),
    user: user(configuration, repositories, encryption)
  };
};
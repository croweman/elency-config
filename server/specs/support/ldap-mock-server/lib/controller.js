const configuration = require('./configuration.js'),
  databaseProvider = require('./database-provider.js');

const ldap = require('ldapjs');

function bind(req, res, next) {

  const requestedDn = req.dn.toString().replace(/, /g, ',');
  const match = configuration.users.find(user => user.dn === requestedDn);

  if (match && req.credentials === match.password) {
    res.end();
    return next();
  }

  next(new ldap.InvalidCredentialsError());
  res.end();
}

function search(req, res) {
  const filterPattern = configuration.server.searchFilter;
  const searchFilter = req.filter.toString();
  let userName = searchFilter.substr(filterPattern.indexOf('=') + 1);
  userName = userName.substr(0, userName.indexOf(')'));
  const users = databaseProvider.getUsers(userName);

  if (users.length > 0) {
    users.forEach((user) => {
      res.send(user);
    });
  }

  res.end();
};

module.exports = {
  bind,
  search
};

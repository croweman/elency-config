const configuration = require('./configuration.js'),
  databaseProvider = require('./database-provider.js');


function bind(request, response) {
  response.end();
}

function search(request, response) {
  const filterPattern = configuration.server.searchFilter;
  const searchFilter = request.filter.toString();

  let userName = searchFilter.substr(filterPattern.indexOf('{{') + 2);
  userName = userName.substr(0, userName.indexOf('}}'));

  const users = databaseProvider.getUsers(userName);

  if (users.length > 0) {
    users.forEach((user) => {
      response.send(user);
    });
  }

  response.end();
};

module.exports = {
  bind,
  search
};

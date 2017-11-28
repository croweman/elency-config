const configuration = require('./configuration.js');

module.exports.getUsers = (login) => {
  const users = configuration.users;
  const loginAttribute = configuration.server.userLoginAttribute;
  let fetchedUser;
  let entries = [];

  for (let user in users) {
    let match = false;
    let userName = users[user][loginAttribute];

    if (login.substr(0, 1) === '*' && login.substr(login.length - 1) === '*') {
      let updatedLogin = login.replace(/\*/g, '');
      match = userName.toLowerCase().indexOf(updatedLogin.toLowerCase()) !== -1;
    }
    else if (login.substr(0, 1) === '*') {
      let updatedLogin = login.replace(/\*/g, '');
      match = userName.toLowerCase().endsWith(updatedLogin.toLowerCase());
    }
    else {
      match = userName.toLowerCase() === login.toLowerCase();
    }

    if (match === true) {
      fetchedUser = users[user];
      let matchedUser = { attributes: {} };
      matchedUser.dn = fetchedUser.dn;

      for (let propertyName in fetchedUser) {
        if (propertyName !== 'dn')
          matchedUser.attributes[propertyName] = fetchedUser[propertyName];
      }

      entries.push(matchedUser);
    }
  }

  return entries;
};

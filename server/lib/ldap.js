const ldapjs = require('ldapjs');

let enc;

function validate(settings) {
  return new Promise((resolve, reject) => {
    try {
      const client = ldapjs.createClient({
        url: settings.ldapUri
      });

      client.on('error', (err) => {
        reject(err);
      });

      client.bind(settings.ldapManagerDn, settings.ldapManagerPassword, function (err) {
        if (err) {
          return reject(err);
        }

        resolve();
      });
    }
    catch (err)
    {
      reject(err);
    }
  });
}

function search(settings, userName, exact = true) {
  return new Promise((resolve, reject) => {
    try {
      const client = ldapjs.createClient({
        url: settings.ldapUri
      });

      client.on('error', (err) => {
        reject(err);
      });

      enc.decrypt(settings.ldapManagerPassword)
        .then((password) => {
          const entries = [];

          client.bind(settings.ldapManagerDn, password, function (err) {
            if (err) {
              return reject(err);
            }

            let filter = settings.ldapSearchFilter;
            let wildcard = (exact !== true ? '*' : '');
            filter = filter.replace('{0}', `${wildcard}${userName}${wildcard}`);
            let userNameProperty = filter.substr(0, filter.indexOf('='));

            if(userNameProperty.startsWith('(')) {
              userNameProperty = userNameProperty.substr(1);
            }

            var opts = {
              filter: filter,
              scope: 'sub'
            };

            client.search(settings.ldapSearchBase, opts, function (err, res) {
              if (err) {
                return reject(err);
              }

              res.on('searchEntry', function (entry) {
                entries.push(presentEntry(entry.object, userNameProperty));
              });

              res.on('error', function (err) {
                reject(err);
              });

              res.on('end', function (result) {
                if (result.status === 0) {
                  return resolve(entries);
                }

                reject();
              });
            });

          });
        })
        .catch((err) => {
          reject(err);
        });
    }
    catch (err) {
      reject(err);
    }
  });
}

function login(settings, userDn, password) {
  return new Promise((resolve, reject) => {
    try {
      const client = ldapjs.createClient({
        url: settings.ldapUri
      });

      client.on('error', (err) => {
        reject(err);
      });

      client.bind(userDn, password, function (err) {
        if (err) {
          return reject(err);
        }

        return resolve();
      });
    }
    catch (err) {
      reject(err);
    }
  });
}

function presentEntry(entry, userNameProperty) {
  let presentedEntry = {
    objectGUID: formatGUID(entry.objectGUID),
    userName: entry[userNameProperty],
    name: entry.name || entry.cn,
    email: entry.userPrincipalName || '',
    dn: entry.dn
  };

  if (!presentedEntry.userName) {
    presentedEntry.userName = presentedEntry.name;
  }

  return presentedEntry;
}

function formatGUID(objectGUID) {

  if (objectGUID.length === 36) {
    return objectGUID;
  }

  let data = new Buffer(objectGUID, 'binary');
  let template = '{3}{2}{1}{0}-{5}{4}-{7}{6}-{8}{9}-{10}{11}{12}{13}{14}{15}';

  for (let i = 0; i < data.length; i++) {
    var dataStr = data[i].toString(16);
    dataStr = data[i] >= 16 ? dataStr : '0' + dataStr;
    template = template.replace(new RegExp('\\{' + i + '\\}', 'g'), dataStr);
  }

  return template;
}

module.exports = (encryption) => {
  enc = encryption;

  return {
    validate,
    search,
    login
  };
};
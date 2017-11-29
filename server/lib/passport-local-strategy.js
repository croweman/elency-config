const LocalStrategy = require('passport-local').Strategy;
const logger = require('./logger');
const hasher = require('./hashers/hmac-sha256');
const ldap = require('./ldap');

module.exports = (repositories, encryption, config) => {
  
  const ldapInstance = ldap(encryption);

  return new LocalStrategy(
    (username, password, done) => {
      process.nextTick(() => {

          function findUserByUserName() {

            repositories.user.findByUserName(username.toLowerCase())
              .then((user) => {
                if (user.isNull()) {
                  return done(null, false, {message: 'Unknown user ' + username});
                }

                const passwordHash = user.getHashedPassword(hasher, password, config.configEncryptionKey);

                if (passwordHash !== user.password) {
                  return done(null, false, {message: 'Invalid password'});
                }

                if (!user.enabled) {
                  return done(null, false, {message: 'User has been disabled'});
                }

                return done(null, user);
              })
              .catch((err) => {
                logger.error(err);
                return done(null, false, {message: 'Unknown user ' + username});
              });
          }

          function findUserByUserId(userId) {

            repositories.user.find(userId)
              .then((user) => {
                if (user.isNull()) {
                  return done(null, false, { message: `Unknown user ${username}` });
                }

                if (!user.enabled) {
                  return done(null, false, {message: 'User has been disabled'});
                }

                return done(null, user);
              })
              .catch((err) => {
                logger.error(err);
                return done(null, false, { message: `Unknown user ${username}` });
              });
          }

          repositories.settings.find()
            .then((settings) => {
              const queryMongo = (username.toLowerCase() === 'admin' || settings.isNull() || (!settings.isNull() && settings.ldapEnabled !== true));

              if (queryMongo === true) {
                return findUserByUserName();
              }
              else {
                ldapInstance.search(settings, username, true)
                  .then((entries) => {
                    if (entries.length === 0) {
                      return done(null, false, { message: `Unknown user ${username}` });
                    }
                    
                    let entry = entries[0];
                    ldapInstance.login(settings, entry.dn, password)
                      .then(() => {
                        return findUserByUserId(entry.objectGUID);
                      })
                      .catch((err) => {
                        logger.error(err);
                        if (err.toString().indexOf('InvalidCredentialsError') !== -1) {
                          return done(null, false, {message: 'Invalid password'});
                        }
                        else {
                          return done(null, false, {message: `Unknown user ${username}`});
                        }
                      });
                  })
                  .catch((err) => {
                    logger.error(err);
                    return done(null, false, { message: `Unexpected error, check whether LDAP connectivity settings are invalid` });
                  });
              }
            })
            .catch((err) => {
              logger.error(err);
              return done(null, false, { message: 'Error' });
            });
      });
    }
  );
};
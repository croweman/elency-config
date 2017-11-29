const configuration = require('./lib/configuration.js'),
  Server = require('./lib/ldap-server.js');

let server = new Server(configuration.server.port);
server.start();

module.exports = {
  listening: () => { return server.listening; },
  stop: server.stop
};

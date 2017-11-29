const ldap = require('ldapjs'),
  controller = require('./controller.js'),
  configuration = require('./configuration.js');

class Server {

  constructor(port) {
    this.app = ldap.createServer();
    this.port = port;
    this.listening = false;
    this.mountRoutes();
  }

  mountRoutes() {
    this.app.bind(configuration.server.searchBase, controller.bind);
    this.app.search(configuration.server.searchBase, controller.search);
  }

  start() {
    this.app.listen(this.port, (a, b, c) => {
      process.stdout.write(`LDAP server listening on port ${this.port}\n`);
      this.listening = true;
    });
  }
  
  stop() {
    process.stdout.write('LDAP server closing\n');
  }
}

module.exports = Server;

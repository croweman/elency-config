const app = require('./app');
const logger = require('./lib/logger');

async function startup() {
  try {
    let application = await app.create();
    let key, cert;

    if (process.env.ELENCY_CONFIG_RUNNING_LOCALLY) {
      const fs = require('fs');
      const https = require('https');
      key = fs.readFileSync('./development/key.pem');
      cert = fs.readFileSync('./development/cert.pem');
      application = https.createServer({ key: key, cert: cert }, application)
    }

    const port = process.env.PORT || 3000;
    const server = application.listen(port, '0.0.0.0', () => {
      logger.info(`elency-config listening on ${port}`);
    });

    process.on('SIGTERM', () => {
      logger.info('Recieved SIGTERM: attempting gracefull shutdown.');

      server.close(() => {
        logger.info('Closed out remaining connections. Shutting down...');
        process.exit();
      });
    });
  }
  catch (err) {
    logger.fatal(err);
    process.exit(1);
  }
}

startup();

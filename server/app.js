const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo')(session);
const controllers = require('./controllers');
const rsa = require('./lib/encryptors/rsa');
const aes256ctr = require('./lib/encryptors/aes-256-ctr');
const repositories = require('./lib/repositories');
const encryption = require('./lib/utils/encryption');
const responseMiddleware = require('./lib/middleware/response');
const logger = require('./lib/logger');
const passportLocalStrategy = require('./lib/passport-local-strategy');
const Configuration = require('./lib/configuration');

async function create() {

  let config = await getConfiguration();
  
  let repos = await repositories(config);
  let encryptionInstance = encryption(config);
  let controllerInstances = controllers(config, repos, encryptionInstance);
  return createApp(config, repos, controllerInstances, encryptionInstance);
}

function createApp(config, repos, controllerInstances, encryptionInstance) {
  const app = express();

  app.disable('x-powered-by');

  app.use(bodyParser.urlencoded({
    extended: true
  }));

  app.use(bodyParser.json({ limit: config.maxJsonPostSize || '1mb' }));

  const exposeUIRoutes = config.exposeUIRoutes;

  if (exposeUIRoutes) {
    addUIRoutes(app, config, controllerInstances, repos, encryptionInstance);
  }

  app.use('/config', controllerInstances.config);

  app.use('/private/ping', (req, res) => {
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.status(200).send({ 'ping': 'pong' });
  });

  app.use(errorHandler(config));

  return app;
}

function addUIRoutes(app, config, controllerInstances, repos, encryptionInstance) {
  app.use(cookieParser());

  app.get('/favicon.ico', function (req, res) {
    res.sendStatus(204);
  });

  app.set('views', './views')
  app.set('view engine', 'pug');

  const sessionOptions = {
    // session lives for 60 minutes
    cookie: {
      maxAge: 60 * 60 * 1000,
      secure: !config.runOverHttp
    },
    secret: config.configEncryptionKey,
    resave: true,
    httpOnly: true,
    name: 'elencyConfig',
    rolling: true,
    saveUninitialized: false,
    store: new MongoStore({
      url: config.mongoUrl
    })
  };

  app.use(session(sessionOptions));

  app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: 86400000
  }));

  passport.serializeUser((user, done) => {
    done(null, user.userId);
  });

  passport.deserializeUser((userId, done) => {
    findById(repos.user, userId, (err, user) => {
      done(err, user);
    });
  });

  let responseMiddlewareInstance = responseMiddleware(repos);
  app.use(responseMiddlewareInstance);
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());

  const passportLocalStrategyInstance = passportLocalStrategy(repos, encryptionInstance, config);
  passport.use(passportLocalStrategyInstance);

  app.use('/', controllerInstances.general);
  app.use('/key', controllerInstances.key);
  app.use('/team', controllerInstances.team);
  app.use('/user', controllerInstances.user);
}

function findById(userRepo, userId, fn) {
  userRepo.find(userId)
    .then((user) => {
      if (user.isNull()) {
        return fn(new Error(`User ${userId} does not exist`));
      }

      fn(null, user);
    })
    .catch((err) => {
      logger.error(err);
      fn(new Error(`User ${userId} does not exist`));
    });
}

function errorHandler(exposeUIRoutes) {
  return async (err, req, res, next) => {

    if (err) {
      logger.error(err);
    }

    if (exposeUIRoutes) {
      await res.renderErrorNoState();
    }
    else {
      res.sendStatus(500);
    }
  };
}

async function getConfiguration() {
  if (!fs.existsSync('./sec/elency-config.private.pem')) {
    throw new Error('elency-config.private.pem key cannot be found');
  }

  if (!fs.existsSync('./sec/elency-config.public.pem')) {
    throw new Error('elency-config.public.pem key cannot be found');
  }

  if (!fs.existsSync('./config/config.json')) {
    throw new Error('config.json could not be found');
  }

  if (!fs.existsSync('./config/keys.json')) {
    throw new Error('keys.json could not be found');
  }

  let fileContent = fs.readFileSync('./config/keys.json').toString('utf8');
  fileContent = await rsa.decrypt(fileContent, './sec/elency-config.private.pem');

  let keys = JSON.parse(fileContent);

  if (!keys.configEncryptionKey || keys.configEncryptionKey.length === 0) {
    throw 'configEncryptionKey is not defined in keys.json';
  }

  if (keys.configEncryptionKey.length !== 32) {
    throw 'configEncryptionKey length must be 32';
  }
  
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(keys.configEncryptionKey)) {
    throw new Error('configEncryptionKey must be a Base64 encoded string');
  }

  fileContent = fs.readFileSync('./config/config.json').toString('utf8');
  fileContent = await aes256ctr.decrypt(fileContent, keys.configEncryptionKey);

  let config = JSON.parse(fileContent);

  if (!config.mongoUrl || config.mongoUrl.length === 0) {
    throw 'mongoUrl is not defined in config.json';
  }

  if (!config.HMACAuthorizationKey || config.HMACAuthorizationKey.length === 0) {
    throw 'HMACAuthorizationKey is not defined in config.json';
  }
  
  config.configEncryptionKey = keys.configEncryptionKey;
  return new Configuration(config);
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
  if (err.stack) {
    console.log(err.stack);
  }
});

module.exports = {
  create
};

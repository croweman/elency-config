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
const aes256cbc = require('./lib/encryptors/aes-256-cbc');
const repositories = require('./lib/repositories');
const encryption = require('./lib/utils/encryption');
const responseMiddleware = require('./lib/middleware/response');
const logger = require('./lib/logger');
const passportLocalStrategy = require('./lib/passport-local-strategy');
const Configuration = require('./lib/configuration');
const md5 = require('./lib/hashers/hmac-md5');
const { processPermissions } = require('./domain/permissions');

async function create() {

  createConfigurationFromEnvironmentVariables();
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

  app.use('/private/health', async (req, res) => {
    res.set('Content-Type', 'application/json; charset=utf-8');
    try {
      await repos.isHealthy();
      res.status(200).send({'healthy': 'true'});
    }
    catch (err) {
      logger.error('Application is not healthy', err);
      res.status(500).send({'healthy': 'false'});
    }
  });

  app.use(errorHandler(config));

  return app;
}

function updateFooterAppVersion() {
  const packageContent = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));
  const version = packageContent.version;
  const footerFilePath = path.join(__dirname, 'views/includes/footer.pug');
  let footerContent = fs.readFileSync(footerFilePath).toString('utf8');
  footerContent = footerContent.replace('#VERSION#', version);
  fs.writeFileSync(footerFilePath, footerContent);
}

function addUIRoutes(app, config, controllerInstances, repos, encryptionInstance) {
  app.use(cookieParser());

  app.get('/favicon.ico', function (req, res) {
    res.sendStatus(204);
  });

  updateFooterAppVersion();

  app.set('views', './views');
  app.set('view engine', 'pug');

  const maxAge = (config.sessionLifeTimeInMinutes !== undefined ? 60 * 1000 * config.sessionLifeTimeInMinutes : 60 * 60 * 24 * 14 * 1000);
  const sessionOptions = {
    // session lives by default for 14 days
    cookie: {
      maxAge,
      secure: true
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
    findById(repos, userId, (err, user) => {
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
  app.use('/role', controllerInstances.role);

  const cssFileName = createHashedFile('./public/css/', 'elency-config.css', 'elency-config', '.css');
  const javascriptFileName = createHashedFile('./public/js/', 'elency-config.js', 'elency-config', '.js');
  process.env.elencyConfigJsFileName = javascriptFileName;
  process.env.elencyConfigCssFileName = cssFileName;
}

function createHashedFile(filePath, fileName, outputFileNamePrefix, outputFileNameSuffix) {
  const content = fs.readFileSync(path.join(__dirname, `${filePath}/${fileName}`));
  let hash = md5.hashSync(content);
  hash = hash.replace(/\+/g, '');
  hash = hash.replace(/\//g, '');
  hash = hash.replace(/\=/g, '');
  const newFileName = `${outputFileNamePrefix}_${hash}${outputFileNameSuffix}`;
  const targetFilePath = path.join(__dirname, `${filePath}/${newFileName}`);
  if (!fs.existsSync(targetFilePath)) {
    fs.createReadStream(path.join(__dirname, `${filePath}/${fileName}`)).pipe(fs.createWriteStream(targetFilePath));
  }
  return newFileName;
}

function findById(repos, userId, fn) {
  repos.user.find(userId)
    .then((user) => {
      if (user.isNull()) {
        return fn(new Error(`User ${userId} does not exist`));
      }

      processPermissions(repos, user)
        .then(() => {
          fn(null, user);
        })
        .catch((err) => {
          logger.error(err);
          fn(new Error(`An error occurred while processing permissions for user ${userId}`));
        });
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
      if (res.renderErrorNoState) {
        await res.renderErrorNoState();
      }
      else {
        res.sendStatus(500);
      }
    }
    else {
      res.sendStatus(500);
    }
  };
}

function createConfigurationFromEnvironmentVariables() {

  function fixPemKey(value) {
    let fixedValue = value.replace(/#NEWLINE#/g, '\n');
    if (!fixedValue.endsWith('\n')) {
      fixedValue += '\n';
    }
    return fixedValue;
  }

  if (process.env.CONFIG_JSON_VALUE !== undefined) {
    fs.writeFileSync(path.join(__dirname, './config/config.json'), process.env.CONFIG_JSON_VALUE);
  }

  if (process.env.KEYS_JSON_VALUE !== undefined) {
    fs.writeFileSync(path.join(__dirname, './config/keys.json'), process.env.KEYS_JSON_VALUE);
  }

  if (process.env.PRIVATE_PEM_VALUE !== undefined) {
    fs.writeFileSync(path.join(__dirname, './sec/elency-config.private.pem'), fixPemKey(process.env.PRIVATE_PEM_VALUE));
  }

  if (process.env.PUBLIC_PEM_VALUE !== undefined) {
    fs.writeFileSync(path.join(__dirname, './sec/elency-config.public.pem'), fixPemKey(process.env.PUBLIC_PEM_VALUE));
  }
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

  let keys;

  try {
    keys = JSON.parse(fileContent);
  }
  catch (err) {
    logger.error(err);
    throw err;
  }

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
  fileContent = await aes256cbc.decrypt([ fileContent, '3564373164373033' ], keys.configEncryptionKey);

  let config;

  try {
    config = JSON.parse(fileContent);
  }
  catch (err) {
    logger.error(err);
    throw err;
  }

  if (!config.mongoUrl || config.mongoUrl.length === 0) {
    throw 'mongoUrl is not defined in config.json';
  }

  if (!config.HMACAuthorizationKey || config.HMACAuthorizationKey.length === 0) {
    throw 'HMACAuthorizationKey is not defined in config.json';
  }

  if (config.sessionLifeTimeInMinutes && isNaN(parseInt(config.sessionLifeTimeInMinutes))) {
    throw 'sessionLifeTimeInMinutes must be a valid integer';
  }

  config.configEncryptionKey = keys.configEncryptionKey;
  return new Configuration(config);
}

process.on('unhandledRejection', (reason, p) => {
  logger.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

process.on('uncaughtException', function(err) {
  logger.error('Caught exception', err);
});

module.exports = {
  create
};

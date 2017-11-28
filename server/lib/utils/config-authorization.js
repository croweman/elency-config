const hasher = require('../hashers/hmac-sha256');
const logger = require('../logger');

let authorizationTokenValidationWindowInSeconds;
let encryptionInstance;
let elencyConfig;
let validateAuthorizationTokenWindow;

async function isAuthorized(configuration, req, method, timestampDate) {

  try {
    const val = req.headers['authorization'];

    if (!val || val.trim().length === 0) {
      return 401;
    }

    const parts = val.split(':');

    if (parts.length !== 4) {
      return 403;
    }

    const appId = parts[0];
    const nonce = parts[2];
    let timestamp = parseInt(parts[3]);

    if (isNaN(timestamp)) {
      return 403;
    }

    if (new Date(timestamp).toString() === 'Invalid Date') {
      return 403;
    }

    let path = (req.baseUrl + req.route.path).replace(/\/$/, "");

    let authorizationKey = '';

    if (configuration.keyEncrypted !== undefined && configuration.keyEncrypted === false) {
      authorizationKey = configuration.key;
    }
    else {
      authorizationKey = await encryptionInstance.decryptKey(configuration.key);
    }

    const signature = generateSignature(req, appId, path, method, nonce, timestamp, authorizationKey.value);
    
    if ((parts[1] === signature)) {
      if (validateAuthorizationTokenWindow === true && !withinWindow(timestamp, timestampDate)) {
        return 403;
      }

      return 0;
    }

    return 403;
  }
  catch (err) {
    logger.error(err);
    return 403;
  }
}

function generateSignature(req, appId, path, method, nonce, timestamp, authorizationKey) {

  if (req.params) {
    Object.keys(req.params).forEach((key) => {
      path = path.replace(`:${key}`, req.params[key].toLowerCase());
    });
  }

  const value = `${appId}${path}${method}${nonce}${timestamp}`;
  return hasher.hashSync(value, authorizationKey);
}

function withinWindow(timestamp, timestampDate) {
  var differenceInSeconds = differenceBetweenDatesInSeconds(new Date(timestamp), timestampDate || new Date());

  if (differenceInSeconds > authorizationTokenValidationWindowInSeconds) {
    return false;
  }

  return true;
}

function differenceBetweenDatesInSeconds(dateOne, dateTwo) {
  var dif = dateOne.getTime() - dateTwo.getTime();
  return Math.abs(dif / 1000);
}

module.exports = (config, encryption) => {
  encryptionInstance = encryption;
  elencyConfig = config;
  validateAuthorizationTokenWindow = elencyConfig.validateAuthorizationTokenWindow;
  authorizationTokenValidationWindowInSeconds = elencyConfig.authorizationTokenValidationWindowInSeconds;

  return {
    isAuthorized
  };
};
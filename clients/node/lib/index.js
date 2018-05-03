const fs = require('fs'),
  request = require('request'),
  authorization = require('./authorization'),
  aes256cbc = require('./encryptors/aes-256-cbc'),
  versionNumber = require('./validation/version-number'),
  path = require('path'),
  debug = require('debug')('elency-config'),
  valueRetrieval = require('./value-retrieval');

module.exports = (configuration) => {

  validateConfiguration(configuration);

  if (configuration.refreshInterval === undefined)
    configuration.refreshInterval = 0;

  let initialized = false;
  let elencyConfig = configuration;
  let currentConfiguration;
  let currentVersionHash;
  let currentAppVersion;
  let currentEnvironment;
  let currentConfigurationId;
  let currentKeys;
  let elencyConfigRequestOptions;
  let retrievedCallback;
  let refreshFailureCallback;
  let refreshing = false;
  let intervalId;

  function validateLocalConfiguration(localConfiguration) {
    if (!localConfiguration.appVersion) {
      throw new Error('appVersion has not been defined on localConfiguration');
    }

    if (!localConfiguration.environment) {
      throw new Error('environment has not been defined on localConfiguration');
    }

    if (!localConfiguration.configurationId) {
      throw new Error('configurationId has not been defined on localConfiguration');
    }

    if (!localConfiguration.configurationData) {
      throw new Error('configurationData has not been defined on localConfiguration');
    }
  }

  function validateConfiguration(configuration) {
    if (!configuration)
      throw new Error('invalid configuration');

    if (!configuration.uri || configuration.uri.trim().length == 0)
      throw new Error('uri has not been defined');

    if (!configuration.appId || configuration.appId.trim().length == 0)
      throw new Error('appId has not been defined');

    if (!configuration.environment || configuration.environment.trim().length == 0)
      throw new Error('environment has not been defined');

    if (!configuration.appVersion || !versionNumber.validate(configuration.appVersion))
      throw new Error('valid app version has not been defined');

    if (!configuration.HMACAuthorizationKey || configuration.HMACAuthorizationKey.trim().length == 0)
      throw new Error('HMACAuthorizationKey has not been defined');

    if (configuration.HMACAuthorizationKey.length !== 32) {
      throw new Error('HMACAuthorizationKey length should be 32');
    }

    if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(configuration.HMACAuthorizationKey)) {
      throw new Error('HMACAuthorizationKey must be a Base64 encoded string');
    }

    if ((configuration.refreshInterval !== undefined && configuration.refreshInterval !== null) && (!parseInt(configuration.refreshInterval) && configuration.refreshInterval !== 0))
      throw new Error('refreshInterval is invalid');

    if (!configuration.configEncryptionKey || configuration.configEncryptionKey.trim().length == 0)
      throw new Error('configEncryptionKey has not been defined');

    if (configuration.configEncryptionKey.length !== 32) {
      throw new Error('configEncryptionKey length should be 32');
    }

    if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(configuration.configEncryptionKey)) {
      throw new Error('configEncryptionKey must be a Base64 encoded string');
    }

    if (configuration.retrieved !== undefined && typeof configuration.retrieved !== 'function') {
      throw new Error('retrieved must be a callback function');
    }

    if (configuration.refreshFailure !== undefined && typeof  configuration.refreshFailure !== 'function') {
      throw new Error('refreshFailure must be a callback function');
    }
    
    if (configuration.localConfiguration) {
      validateLocalConfiguration(configuration.localConfiguration);
    }
  }

  function buildRequestResult(resolve, error, response, body) {
    return resolve({
      error,
      body,
      headers: (response ? response.headers : {}),
      statusCode: response ? response.statusCode : undefined
    });
  }

  function makeRequest(requestOptions) {

    return new Promise((resolve) => {

      request(requestOptions, (error, response, body) => {

        if (error) {
          debug(error);
          return buildRequestResult(resolve, error, response, body);
        }

        return buildRequestResult(resolve, error, response, body);
      });
    });
  }

  async function getAccessToken() {

    const authorizationHeader = await authorization.generateAuthorizationHeader(elencyConfig, '/config', 'head', true);

    let requestOptions = {
      url: elencyConfigRequestOptions.uri + '/config',
      method: 'head',
      headers: {
        'Accept': 'application/json',
        'Authorization': authorizationHeader,
        'Content-Type': 'application/json'
      }
    };

    try {
      const response = await makeRequest(requestOptions);

      if (response.statusCode === 200) {
        return response.headers['x-access-token'];
      }

    }
    catch (error) {
      debug(`getAccessToken: ${JSON.stringify(error)}`);
      throw error;
    }

    throw new Error('An error occurred while trying to retrieve an x-access-token');
  }
  
  async function refreshConfiguration() {

    const authorizationHeader = await authorization.generateAuthorizationHeader(elencyConfig, elencyConfigRequestOptions.configurationPath, 'head');

    let requestOptions = {
      url: elencyConfigRequestOptions.uri + elencyConfigRequestOptions.configurationPath,
      method: 'head',
      headers: {
        'Accept': 'application/json',
        'Authorization': authorizationHeader,
        'Content-Type': 'application/json',
        'x_version_hash': currentVersionHash
      }
    };

    try {
      const response = await makeRequest(requestOptions);

      if (response.statusCode === 200) {
        await retrieveConfiguration();
        return;
      }

      if (response.statusCode === 204) {
        return;
      }
    }
    catch (error) {
      debug(`refreshConfiguration: ${JSON.stringify(error)}`);
      throw error;
    }

    throw new Error('An error occurred while trying to refresh the configuration');
  }

  async function retrieveConfiguration() {

    try {
      const accessToken = await getAccessToken();
      const authorizationHeader = await authorization.generateAuthorizationHeader(elencyConfig, elencyConfigRequestOptions.configurationPath, 'get');

      let requestOptions = {
        url: elencyConfigRequestOptions.uri + elencyConfigRequestOptions.configurationPath,
        method: 'get',
        headers: {
          'Accept': 'application/json',
          'Authorization': authorizationHeader,
          'Content-Type': 'application/json',
          'x-access-token': accessToken
        },
        json: true
      };

      const response = await makeRequest(requestOptions);

      if (response.statusCode === 200) {

        const configurationData = {};
        let body = response.body;

        body.configuration = await aes256cbc.decrypt(body.configuration, configuration.configEncryptionKey);
        body.configuration = JSON.parse(body.configuration);

        for (let i = 0; i < body.configuration.length; i++) {
          let item = body.configuration[i];
          
          if(item.encrypted !== true) {
            configurationData[item.key] = item.value[0];
            continue;
          }
          
          item.value = await aes256cbc.decrypt(item.value, configuration.configEncryptionKey);
          configurationData[item.key] = item.value;
        }

        currentAppVersion = body.appVersion;
        currentEnvironment = body.environment;
        currentConfigurationId = body.configurationId;
        currentConfiguration = configurationData;
        currentVersionHash = body.configurationHash;
        currentKeys = Object.keys(currentConfiguration).map((key) => { return key; });
        initialized = true;

        if (retrievedCallback) {
          await retrievedCallback();
        }

        return;
      }
    }
    catch (error) {
      debug(`retrieveConfiguration: ${JSON.stringify(error)}`);
      throw error;
    }

    throw new Error('An error occurred while trying to retrieve the configuration');
  }

  async function getConfiguration() {
    let configuration;

    if (currentVersionHash) {
      try {
          refreshing = true;
          configuration = await refreshConfiguration();
          refreshing = false;
      }
      catch (err) {
        refreshing = false;
        throw err;
      }
    }
    else {
      configuration = await retrieveConfiguration()
    }

    return configuration;
  }

  function checkInitialisation() {
    if (!initialized)
      throw new Error('The client has not been successfully initialized');
  }

  async function init() {

    if (configuration.retrieved) {
      retrievedCallback = configuration.retrieved;
    }

    if (configuration.refreshFailure) {
      refreshFailureCallback = configuration.refreshFailure;
    }

    if (configuration.localConfiguration) {
      currentAppVersion = configuration.localConfiguration.appVersion;
      currentEnvironment = configuration.localConfiguration.environment;
      currentConfigurationId = configuration.localConfiguration.configurationId;
      currentConfiguration = configuration.localConfiguration.configurationData;
      currentKeys = Object.keys(currentConfiguration).map((key) => { return key; });
      initialized = true;
      
      if (retrievedCallback) {
        await retrievedCallback();
      }
      return;
    }

    let configurationPath = `/config/${elencyConfig.appId}/${elencyConfig.environment}/${elencyConfig.appVersion}`;

    elencyConfigRequestOptions = {
      uri: elencyConfig.uri,
      configurationPath
    };

    await getConfiguration();

    if (elencyConfig.refreshInterval && elencyConfig.refreshInterval > 0) {
      intervalId = setInterval(async function() {
          if (refreshing === true) {
              return;
          }

          try {
              await getConfiguration();
          }
          catch (err) {
              debug(`error while refreshing configuration: ${JSON.stringify(err)}`);

              if (refreshFailureCallback) {
                  refreshFailureCallback(err);
              }
          }
      }, parseInt(elencyConfig.refreshInterval));
    }
  }

  function dispose() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = undefined;
    }

    initialized = false;
  }

  function appVersion() {
    checkInitialisation();
    return currentAppVersion;
  }

  function environment() {
    checkInitialisation();
    return currentEnvironment;
  }

  function configurationId() {
    checkInitialisation();
    return currentConfigurationId;
  }

  function get(key) {
    checkInitialisation();
    return currentConfiguration[key];
  }

  function getAllKeys() {
    checkInitialisation();
    return currentKeys;
  }
  
  function getBoolean(key, fallback) {
    return valueRetrieval.getBoolean(get(key), fallback);
  }

  function getDate(key, fallback) {
    return valueRetrieval.getDate(get(key), fallback);
  }

  function getInt(key, fallback) {
    return valueRetrieval.getInt(get(key), fallback);
  }

  function getFloat(key, fallback) {
    return valueRetrieval.getFloat(get(key), fallback);
  }

  function getObject(key, fallback) {
    return valueRetrieval.getObject(get(key), fallback);
  }

  async function refresh() {
    checkInitialisation();
    await getConfiguration();
  }

  return {
    init,
    dispose,
    get appVersion() {
      return appVersion();
    },
    get environment() {
      return environment();
    },
    get configurationId() {
      return configurationId();
    },
    get,
    getBoolean,
    getDate,
    getInt,
    getFloat,
    getObject,
    getAllKeys,
    refresh
  };
};
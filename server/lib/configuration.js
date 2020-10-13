class Configuration
{
  constructor(config) {
    config = config || {};
    this.maxJsonPostSize = config.maxJsonPostSize || '1mb';
    this.exposeUIRoutes = (config.exposeUIRoutes && (config.exposeUIRoutes === true || config.exposeUIRoutes === 'true'));
    this.configEncryptionKey = config.configEncryptionKey;
    this.mongoUrl = config.mongoUrl;
    this.HMACAuthorizationKey = config.HMACAuthorizationKey;
    this.validateAuthorizationTokenWindow = (config.validateAuthorizationTokenWindow && (config.validateAuthorizationTokenWindow === true || config.validateAuthorizationTokenWindow === 'true'));
    this.authorizationTokenValidationWindowInSeconds = (config.authorizationTokenValidationWindowInSeconds ? parseInt(config.authorizationTokenValidationWindowInSeconds) : 60 * 5);
  }
}

module.exports = Configuration;
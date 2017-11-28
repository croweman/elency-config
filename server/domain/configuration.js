const versionSelector = require('../lib/version-selector');

module.exports = (repositories, encryption) => {

  async function getConfiguration(options) {
    let appEnvironment = options.appEnvironment;

    if (appEnvironment === undefined) {
      appEnvironment = await repositories.appEnvironment.find(options.appId, options.environment);

      if (appEnvironment.isNull()) {
        return 404;
      }
    }

    const version = versionSelector.selectVersion(options.appVersion, appEnvironment.versions);

    if (!version) {
      return 404;
    }

    let configuration = await repositories.configuration.find({
      appId: appEnvironment.appId,
      appVersion: version,
      environment: appEnvironment.environment,
      published: true
    });

    if (configuration.isNull()) {
      return 404;
    }

    configuration = await encryption.decryptConfiguration(configuration);
    return configuration;
  }

  async function getViaAppEnvironment(appEnvironment, appVersion) {
    return await getConfiguration({
      appEnvironment,
      appVersion
    });
  }

  async function get(appId, environment, appVersion) {
    return await getConfiguration({
      appId,
      appVersion,
      environment
    });
  }

  return {
    get,
    getViaAppEnvironment
  }
};
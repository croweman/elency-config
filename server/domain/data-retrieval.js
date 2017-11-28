let repositories;

module.exports = (repos) => {
  repositories = repos;

  async function getAppEnvironment(appId, environment) {
    const appEnvironment = await repositories.appEnvironment.find(appId, environment);

    if (!appEnvironment || appEnvironment.isNull()) {
      throw 'appEnvironment not found';
    }

    return appEnvironment;
  }

  async function getApp(appId) {
    const app = await repositories.app.find(appId);

    if (!app || app.isNull()) {
      throw 'app not found';
    }

    return app;
  }

  async function getTeam(teamId) {
    const team = await repositories.team.find(teamId);

    if (!team || team.isNull()) {
      throw 'team not found';
    }

    return team;
  }

  async function getUser(userId) {
    const user = await repositories.user.find(userId);

    if (!user || user.isNull()) {
      throw 'user not found';
    }

    return user;
  }

  async function getKey(keyId) {
    const key = await repositories.key.find(keyId);

    if (!key || key.isNull()) {
      throw 'key not found';
    }

    return key;
  }

  async function getConfiguration(configurationId) {
    const configuration = await repositories.configuration.findByConfigurationId(configurationId);

    if (!configuration || configuration.isNull()) {
      throw 'configuration not found';
    }

    return configuration;
  }

  return {
    getAppEnvironment,
    getApp,
    getTeam,
    getUser,
    getKey,
    getConfiguration
  };
};
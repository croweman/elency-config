let repos;

function createAUser(user) {
  return new Promise((resolve) => {
    if (!user) {
      return resolve(false);
    }

    resolve(user.userName.toLowerCase().trim() === 'admin' || user.hasRole('administrator'));
  });
}

function changeSettings(user) {
  return new Promise((resolve) => {
    if (!user) {
      return resolve(false);
    }

    resolve(user.userName.toLowerCase().trim() === 'admin' || user.hasRole('administrator'));
  });
}

function changeAPassword(user, params) {
  return new Promise((resolve) => {

    if (!user) {
      return resolve(false);
    }

    const userId = params.userId;

    if (!paramsDefined(userId)) {
      return resolve(false);
    }

    repos.settings.find()
      .then((settings) => {
        let ldapEnabled = false;
      
        if (!settings.isNull()) {
          ldapEnabled = settings.ldapEnabled === true;
        }
        
        const isAdmin = (user.userName.toLowerCase().trim() === 'admin' || user.hasRole('administrator'));
        resolve(!ldapEnabled && (isAdmin || user.userId === userId));
      })
      .catch(() => {
        resolve(false);
      })
  });
}

function createATeam(user) {
  return new Promise((resolve) => {
    if (!user) {
      return resolve(false);
    }

    resolve(user.userName.toLowerCase() !== 'admin' && (user.hasRole('administrator') || user.hasRole('team-writer')));
  });
}

function createAnApp(user, params) {
  return new Promise((resolve) => {
    if (!user) {
      return resolve(false);
    }

    const teamId = params.teamId;

    if (!paramsDefined(teamId)) {
      return resolve(false);
    }

    if (user.userName.toLowerCase() === 'admin') {
      return resolve(false);
    }

    for (let i = 0; i < user.teamPermissions.length; i++) {
      if (user.teamPermissions[i].id === teamId && user.teamPermissions[i].write === true) {
        return resolve(true);
      }
    }

    return resolve(false);
  });
}

function readAnApp(user, params) {
  return new Promise((resolve) => {
    if (!user) {
      return resolve(false);
    }

    const appId = params.appId;

    if (!paramsDefined(appId)) {
      return resolve(false);
    }

    if (user.userName.toLowerCase() === 'admin') {
      return resolve(false);
    }

    for (let i = 0; i < user.appConfigurationPermissions.length; i++) {
      if (user.appConfigurationPermissions[i].read === true && user.appConfigurationPermissions[i].id === appId) {
        return resolve(true);
      }
    }

    return resolve(false);
  });
}

function createAnAppEnvironment(user, params) {
  return new Promise((resolve) => {
    if (!user) {
      return resolve(false);
    }

    const teamId = params.teamId;

    if (!paramsDefined(teamId)) {
      return resolve(false);
    }

    if (user.userName.toLowerCase() === 'admin') {
      return resolve(false);
    }

    for (let i = 0; i < user.teamPermissions.length; i++) {
      if (user.teamPermissions[i].id === teamId && user.teamPermissions[i].write === true) {
        return resolve(true);
      }
    }

    return resolve(false);
  });
}

function createAConfiguration(user, params) {
  return new Promise((resolve) => {
    if (!user) {
      return resolve(false);
    }

    const appId = params.appId;
    const environment = params.environment;

    if (!paramsDefined(appId, environment)) {
      return resolve(false);
    }

    if (user.userName.toLowerCase() === 'admin') {
      return resolve(false);
    }

    for (let i = 0; i < user.appConfigurationPermissions.length; i++) {
      const permission = user.appConfigurationPermissions[i];

      if (permission.id === appId && permission.environment === environment && permission.write === true) {
        return resolve(true);
      }
    }

    return resolve(false);
  });
}

function readAConfiguration(user, params) {
  return new Promise((resolve) => {
    if (!user) {
      return resolve(false);
    }

    const appId = params.appId;
    const environment = params.environment;

    if (!paramsDefined(appId, environment)) {
      return resolve(false);
    }

    if (user.userName.toLowerCase() === 'admin') {
      return resolve(false);
    }

    for (let i = 0; i < user.appConfigurationPermissions.length; i++) {
      const permission = user.appConfigurationPermissions[i];

      if (permission.id === appId && permission.environment === environment && permission.read === true) {
        return resolve(true);
      }
    }

    return resolve(false);
  });
}

function publishAConfiguration(user, params) {
  return new Promise((resolve) => {
    if (!user) {
      return resolve(false);
    }

    const appId = params.appId;
    const environment = params.environment;

    if (!paramsDefined(appId, environment)) {
      return resolve(false);
    }

    if (user.userName.toLowerCase() === 'admin') {
      return resolve(false);
    }

    for (let i = 0; i < user.appConfigurationPermissions.length; i++) {
      const permission = user.appConfigurationPermissions[i];

      if (permission.id === appId && permission.environment === environment && permission.publish === true) {
        return resolve(true);
      }
    }

    return resolve(false);
  });
}

function deleteAConfiguration(user, params) {
  return new Promise((resolve) => {
    if (!user) {
      return resolve(false);
    }

    const appId = params.appId;
    const environment = params.environment;

    if (!paramsDefined(appId, environment)) {
      return resolve(false);
    }

    if (user.userName.toLowerCase() === 'admin') {
      return resolve(false);
    }

    for (let i = 0; i < user.appConfigurationPermissions.length; i++) {
      const permission = user.appConfigurationPermissions[i];

      if (permission.id === appId && permission.environment === environment && permission.delete === true) {
        return resolve(true);
      }
    }

    return resolve(false);
  });
}


function createAKey(user) {
  return new Promise((resolve) => {
    if (!user) {
      return resolve(false);
    }

    if (user.userName.toLowerCase() === 'admin') {
      return resolve(false);
    }

    resolve(user.userName.toLowerCase() !== 'admin' && (user.hasRole('administrator') || user.hasRole('key-writer')));
  });
}

function paramsDefined(...params) {
  
  for (let i = 0; i < params.length; i++) {
    const param = params[i];

    if (!param || param.trim().length === 0) {
      return false;
    }
  }

  return true;
}

module.exports = (repositories) => {
  repos = repositories;

  return {
    changeSettings,
    createAUser,
    updateAUser: createAUser,
    changeAPassword,
    createATeam,
    updateATeam: createATeam,
    createAnApp,
    updateAnApp: createAnApp,
    readAnApp,
    createAnAppEnvironment,
    updateAnAppEnvironment: createAnAppEnvironment,
    createAConfiguration,
    updateAConfiguration: createAConfiguration,
    readAConfiguration,
    publishAConfiguration,
    deleteAConfiguration,
    createAKey,
    updateAKey: createAKey
  };
};

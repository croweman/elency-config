const constants = require('../lib/constants');

module.exports = (repositories, encryption) => {

  async function getTeams() {
    const teams = await repositories.team.findAll();

    teams.forEach((team) => {
      team.apps = [];
    });

    return teams;
  }

  async function getTeamsAndApps(currentUser) {

    const teams = await getTeams();
    const allApps = await repositories.app.findAll();
    const appEnvironments = await repositories.appEnvironment.findAll();

    let apps = [];

    appEnvironments.forEach((appEnvironment) => {

      let appId = appEnvironment.appId;

      let app = apps.find((item) => { return item.appId === appId; });

      if (!app) {
        app = allApps.find((item) => { return item.appId === appId; });

        const newApp = {
          appId,
          appName: app.appName,
          teamId: app.teamId,
          environments: [
            {
              name: appEnvironment.environment
            }
          ],
          hasPermissions: false
        };

        apps.push(newApp);

        let team = teams.find((item) => { return item.teamId === app.teamId; });
        team.apps.push(newApp);
      }
      else {
        app.environments.push({ name: appEnvironment.environment });
      }

    });

    if (currentUser !== undefined) {
      teams.forEach((team) => {
        team.write = (currentUser.teamPermissions.find((item) => {
          return item.id === team.teamId && item.write === true;
        }) !== undefined);

        team.apps.forEach((app) => {
          app.environments.forEach((appEnvironment) => {
            appEnvironment.read = false;
            appEnvironment.write = false;
            appEnvironment.publish = false;

            let match = currentUser.appConfigurationPermissions.find((item) => {
              return item.id === app.appId && item.environment === appEnvironment.name;
            });

            if (match !== undefined) {
              appEnvironment.read = match.read;
              appEnvironment.write = match.write;
              appEnvironment.publish = match.publish;
            }

            if (appEnvironment.read || appEnvironment.write || appEnvironment.publish) {
              app.hasPermissions = true;
            }
          });
        });
      });
    }

    apps.sort(compare('appName'));

    return {
      teams,
      apps
    };
  };

  function getPermissionsData(teamsAndApps) {
    const teams = [];
    const apps = [];
    const appEnvironments = [];

    teamsAndApps.teams.forEach((team) => {
      teams.push(`${team.teamName} (${team.teamId})`)
    });

    teamsAndApps.apps.forEach((app) => {
      apps.push(`${app.appName} (${app.appId})`);
      let environments = [];

      app.environments.forEach((appEnvironment) => {
        environments.push(appEnvironment.name);
      });

      appEnvironments.push({ appId: app.appId, environments });
    });

    return {
      teams,
      apps,
      appEnvironments
    };
  }
  
  async function getAllRoles(currentUser) {
    let additionalRoles = await repositories.role.findAll();
    let standardRoles = [
      {
        roleId: constants.roleIds.administrator,
        roleName: constants.roleIds.administrator,
        selected: currentUser !== undefined && currentUser.roles.indexOf(constants.roleIds.administrator) !== -1
      },
      {
        roleId: constants.roleIds.keyWriter,
        roleName: constants.roleIds.keyWriter,
        selected: currentUser !== undefined && currentUser.roles.indexOf(constants.roleIds.keyWriter) !== -1
      },
      {
        roleId: constants.roleIds.teamWriter,
        roleName: constants.roleIds.teamWriter,
        selected: currentUser !== undefined && currentUser.roles.indexOf(constants.roleIds.teamWriter) !== -1
      }
    ];

    const roles = [];
    
    additionalRoles.forEach((role) => {
      roles.push({
        roleId: role.roleId,
        roleName: role.roleName,
        selected: false
      });
    });

    if (currentUser) {
      currentUser.roles.forEach((roleId) => {
        let match = roles.find(role => role.roleId === roleId);

        if (match) {
          match.selected = true;
        }
      });
    }

    roles.sort(compare('roleName'));
    
    roles.unshift(...standardRoles);
    return roles;
  }

  function compare(propertyName) {
    return function(a, b) {
      if (a[propertyName].toLowerCase() < b[propertyName].toLowerCase())
        return -1;
      if (a[propertyName].toLowerCase() > b[propertyName].toLowerCase())
        return 1;
      return 0;
    }
  }

  return {
    getTeamsAndApps,
    getPermissionsData,
    getAllRoles
  };
};
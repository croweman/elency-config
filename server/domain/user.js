module.exports = (respositories, encryption) => {

  async function getTeams() {
    const teams = await respositories.team.findAll();

    teams.forEach((team) => {
      team.apps = [];
    });

    return teams;
  }

  async function getTeamsAndApps(currentUser) {

    const teams = await getTeams();
    const allApps = await respositories.app.findAll();
    const appEnvironments = await respositories.appEnvironment.findAll();

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
          ]
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
            appEnvironment.delete = false;

            let match = currentUser.appConfigurationPermissions.find((item) => {
              return item.id === app.appId && item.environment === appEnvironment.name;
            });

            if (match !== undefined) {
              appEnvironment.read = match.read;
              appEnvironment.write = match.write;
              appEnvironment.publish = match.publish;
              appEnvironment.delete = match.delete;
            }
          });
        });
      });
    }

    return teams;
  };

  return {
    getTeamsAndApps
  };
};
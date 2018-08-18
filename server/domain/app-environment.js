module.exports = (repositories, encryption) => {

  async function getTeamsAndApps() {

    const teams = await repositories.team.findAll();
    const apps = await repositories.app.findAll();

    teams.sort(compare('teamName'));
    apps.sort(compare('appName'));
    
    return {
      teams: teams.map((team) => `${team.teamName} (${team.teamId})`),
      apps: apps.map((app) => `${app.appName} (${app.appId})`),
    }
  };

  function getTeamId(team) {
    let teamId = team.substr(team.lastIndexOf('(') + 1);
    return teamId.substr(0, teamId.lastIndexOf(')'));
  }

  function getAppId(app) {
    let appId = app.substr(app.lastIndexOf('(') + 1);
    return appId.substr(0, appId.lastIndexOf(')'));
  }

  function getSelectedTeamsAndApps(teamsAndApps, appEnvironment) {
    let teams = teamsAndApps.teams.filter((team) => {
      let teamId = getTeamId(team);
      return appEnvironment.teamInheritance.indexOf(teamId) !== -1;
    });

    let apps = teamsAndApps.apps.filter((app) => {
      let appId = getAppId(app);
      return appEnvironment.appInheritance.indexOf(appId) !== -1;
    });

    teams = teams.map((team) => {
      return {
        teamId: getTeamId(team),
        displayText: team
      };
    });

    apps = apps.map((app) => {
      return {
        appId: getAppId(app),
        displayText: app
      };
    });

    return {
      teams,
      apps,
    }
  };

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
    getSelectedTeamsAndApps
  };
};
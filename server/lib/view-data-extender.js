const authorization = require('../domain/authorization');

let repos;
let authorizationInstance;

async function extendNoState(viewData, req){
  viewData = viewData || {};
  const user = req.user;
  viewData.user = user;
  viewData.loggedIn = user !== undefined;
  viewData.userName = user ? user.userName : '';
  viewData.roles = user ? user.roles : [];

  viewData.changeSettings = false;
  viewData.createAUser = false;
  viewData.updateAUser = false;
  viewData.createARole = false;
  viewData.updateARole = false;
  viewData.createATeam = false;
  viewData.updateATeam = false;
  viewData.createAnApp = false;
  viewData.updateAnApp = false;
  viewData.readAnApp = false;
  viewData.createAnAppEnvironment = false;
  viewData.updateAnAppEnvironment = false;
  viewData.createAConfiguration = false;
  viewData.updateAConfiguration = false;
  viewData.readAConfiguration = false;
  viewData.publishAConfiguration = false;
  viewData.deleteAConfiguration = false;
  viewData.createAKey = false;
  viewData.updateAKey = false;
  viewData.changeAPassword = false;
  viewData.ldapEnabled = false;
  viewData.elencyConfigJsFileName = process.env.elencyConfigJsFileName;
  viewData.elencyConfigCssFileName = process.env.elencyConfigCssFileName;

  return viewData;
}

async function extend(viewData, req){
  viewData = viewData || {};
  const user = req.user;
  viewData.user = user;
  viewData.loggedIn = user !== undefined;
  viewData.userName = user ? user.userName : '';
  viewData.roles = user ? user.roles : [];

  viewData.changeSettings = await authorizationInstance.changeSettings(user, req.params);
  viewData.createAUser = await authorizationInstance.createAUser(user, req.params);
  viewData.updateAUser = await authorizationInstance.updateAUser(user, req.params);
  viewData.createARole = await authorizationInstance.createARole(user, req.params);
  viewData.updateARole = await authorizationInstance.updateARole(user, req.params);
  viewData.createATeam = await authorizationInstance.createATeam(user, req.params);
  viewData.updateATeam = await authorizationInstance.updateATeam(user, req.params);
  viewData.createAnApp = await authorizationInstance.createAnApp(user, req.params);
  viewData.updateAnApp = await authorizationInstance.updateAnApp(user, req.params);
  viewData.readAnApp = await authorizationInstance.readAnApp(user, req.params);
  viewData.createAnAppEnvironment = await authorizationInstance.createAnAppEnvironment(user, req.params);
  viewData.updateAnAppEnvironment = await authorizationInstance.updateAnAppEnvironment(user, req.params);
  viewData.createAConfiguration = await authorizationInstance.createAConfiguration(user, req.params);
  viewData.updateAConfiguration = await authorizationInstance.updateAConfiguration(user, req.params);
  viewData.readAConfiguration = await authorizationInstance.readAConfiguration(user, req.params);
  viewData.publishAConfiguration = await authorizationInstance.publishAConfiguration(user, req.params);
  viewData.deleteAConfiguration = await authorizationInstance.deleteAConfiguration(user, req.params);
  viewData.createAKey = await authorizationInstance.createAKey(user, req.params);
  viewData.updateAKey = await authorizationInstance.updateAKey(user, req.params);
  viewData.changeAPassword = await authorizationInstance.changeAPassword(user, req.params);
  viewData.ldapEnabled = await ldapEnabled();
  viewData.elencyConfigJsFileName = process.env.elencyConfigJsFileName;
  viewData.elencyConfigCssFileName = process.env.elencyConfigCssFileName;

  return viewData;
}

async function ldapEnabled() {
  let settings = await repos.settings.find();

  let ldapEnabled = false;

  if (!settings.isNull()) {
    ldapEnabled = settings.ldapEnabled === true;
  }

  return ldapEnabled;
}

module.exports = (repositories) => {

  repos = repositories;
  authorizationInstance = authorization(repositories);

  return {
    extend,
    extendNoState
  };
};

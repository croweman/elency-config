const AppModel = require('./app');
const AppEnvironmentModel = require('./app-environment');
const AuditModel = require('./audit');
const ConfigRetrievalModel = require('./config-retrieval');
const ConfigurationModel = require('./configuration');
const ConfigurationKeyModel = require('./configuration-key');
const KeyModel = require('./key');
const AppConfigurationPermissionModel = require('./app-configuration-permission');
const TeamPermissionModel = require('./team-permission');
const TeamModel = require('./team');
const TokenModel = require('./token');
const UserModel = require('./user');
const SettingsModel = require('./settings');

module.exports = {
  app: AppModel,
  appEnvironment: AppEnvironmentModel,
  audit: AuditModel,
  configRetrieval: ConfigRetrievalModel,
  configuration: ConfigurationModel,
  configurationKey: ConfigurationKeyModel,
  key: KeyModel,
  appConfigurationPermission: AppConfigurationPermissionModel,
  teamPermission: TeamPermissionModel,
  team: TeamModel,
  token: TokenModel,
  user: UserModel,
  settings: SettingsModel
};

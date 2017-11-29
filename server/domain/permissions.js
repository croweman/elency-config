const uuidValidate = require('uuid-validate');
const models = require('../models');

function getPermissions(body) {
  const teamPermissions = [];
  const appConfigurationPermissions = [];

  body.teamPermissions = body.teamPermissions || [];
  body.appConfigurationPermissions = body.appConfigurationPermissions || [];

  body.teamPermissions.forEach((id) => {
    teamPermissions.push(new models.teamPermission({
      id: id,
      write: true
    }))
  });

  Object.keys(body.appConfigurationPermissions).forEach((appId) => {
    Object.keys(body.appConfigurationPermissions[appId]).forEach((environment) => {

      var environmentPermissions = body.appConfigurationPermissions[appId][environment];
      var model = new models.appConfigurationPermission({
        id: appId,
        environment,
        read: environmentPermissions.indexOf('r') !== -1,
        write: environmentPermissions.indexOf('w') !== -1,
        publish: environmentPermissions.indexOf('p') !== -1
      });
      appConfigurationPermissions.push(model);

    });
  });

  return {
    teamPermissions,
    appConfigurationPermissions
  };
}

function processPermissions(repositories, user) {
  return new Promise((resolve, reject) => {
    const roleIds = user.roles
      .filter(roleId => uuidValidate(roleId, 4) === true);

    repositories.role.findByRoleIds(roleIds)
      .then((roles) => {
        roles.forEach((role) => {
          if (role.isNull()) {
            return;
          }

          if (role.teamPermissions) {
            role.teamPermissions.forEach((permission) => {
              const userPermission = user.teamPermissions.find(team => team.id === permission.id);

              if (!userPermission) {
                user.teamPermissions.push(permission);
              }
              else {
                if (permission.write === true) {
                  userPermission.write = true;
                }
              }
            });
          }

          if (role.appConfigurationPermissions) {
            role.appConfigurationPermissions.forEach((permission) => {
              const userPermission = user.appConfigurationPermissions.find(app => app.id === permission.id && app.environment === permission.environment);
              if (!userPermission) {
                user.appConfigurationPermissions.push(permission);
              }
              else {
                if (permission.read === true) {
                  userPermission.read = true;
                }
                if (permission.write === true) {
                  userPermission.write = true;
                }
                if (permission.publish === true) {
                  userPermission.publish = true;
                }
                if (permission.delete === true) {
                  userPermission.delete = true;
                }
              }
            });
          }
        });
        resolve(user);
      })
      .catch((err) => {
        reject(err)
      });
  });
}

module.exports = {
  getPermissions,
  processPermissions
};
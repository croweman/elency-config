const uuid = require('uuid').v4;
const constants = require('../lib/constants');

class Role {
  constructor(obj) {
    var obj = obj || {};

    this.roleId = obj.roleId || uuid();
    this.roleName = obj.roleName || '';
    this.teamPermissions = obj.teamPermissions || [];
    this.appConfigurationPermissions = obj.appConfigurationPermissions || [];
    this.updated = obj.updated || new Date();
    this.updatedBy = obj.updatedBy || { userId: '', userName: '' };
  }

  isNull() {
    return this.roleName === undefined || this.roleName.trim().length === 0;
  }
  
  hasRole(roleName) {
    return this.roles.find((current) => { return current == roleName; }) !== undefined;
  }

  isValid() {
    const invalidRoles = [ constants.roleIds.administrator, constants.roleIds.teamWriter, constants.roleIds.keyWriter ];
    return this.roleName !== undefined && this.roleName.trim().length >= 3
      && invalidRoles.indexOf(this.roleName.trim().toLowerCase()) === -1;
  }
}

module.exports = Role;
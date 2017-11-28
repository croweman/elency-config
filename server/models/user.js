const uuid = require('uuid').v4;

const passwordRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/);

class User {
  constructor(obj) {
    var obj = obj || {};

    this.userId = obj.userId || uuid();
    this.userName = obj.userName || '';
    this.password = obj.password || '';
    this.enabled = (obj.enabled !== undefined && (obj.enabled === true || obj.enabled.toString() === 'true'));
    this.roles = obj.roles || [];
    this.teamPermissions = obj.teamPermissions || [];
    this.appConfigurationPermissions = obj.appConfigurationPermissions || [];
    this.updated = obj.updated || new Date();
    this.updatedBy = obj.updatedBy || { userId: '', userName: '' };
    
    this.userName = this.userName.toLowerCase().trim();
    this.password = this.password.trim();
  }

  isNull() {
    return this.userName === undefined || this.userName.trim().length === 0;
  }
  
  hasRole(roleName) {
    return this.roles.find((current) => { return current == roleName; }) !== undefined;
  }

  isValid() {
    return (this.password === '' || passwordRegex.test(this.password))
      && this.userName !== undefined && this.userName.trim().length >= 3;
  }
}

module.exports = User;
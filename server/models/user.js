const uuid = require('uuid').v4;
const { generateBase64Key } = require('../lib/keys');

const passwordRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/);

class User {
  constructor(obj) {
    var obj = obj || {};

    this.userId = obj.userId || uuid();
    this.userName = obj.userName || '';
    this.password = obj.password || '';
    this.salt = obj.salt || generateBase64Key();
    this.enabled = (obj.enabled !== undefined && (obj.enabled === true || obj.enabled.toString() === 'true'));
    this.roles = obj.roles || [];
    this.teamPermissions = obj.teamPermissions || [];
    this.appConfigurationPermissions = obj.appConfigurationPermissions || [];
    this.updated = obj.updated || new Date();
    this.updatedBy = obj.updatedBy || { userId: '', userName: '' };
    this.favourites = obj.favourites || { teams: [], apps: [] };
    
    this.userName = this.userName.toLowerCase().trim();
    this.password = this.password.trim();
    this.twoFactorAuthenticationEnabled = obj.twoFactorAuthenticationEnabled || false;
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

  getHashedPassword(hasher, password, configEncryptionKey) {
    let hashedPassword = hasher.hashSync(password, configEncryptionKey);
    hashedPassword = hasher.hashSync(hashedPassword, this.salt);
    return hashedPassword;
  }
}

module.exports = User;
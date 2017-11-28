class AppEnvironment {
  constructor(obj) {
    var obj = obj || {};

    this.teamId = obj.teamId || '';
    this.teamName = obj.teamName || '';
    this.appId = obj.appId || '';
    this.appName = obj.appName || '';
    this.environment = obj.environment || '';
    this.versions = obj.versions || [];
    this.allVersions = obj.allVersions || [];
    this.keyId = obj.keyId || '';
    this.keyName = obj.keyName || '';

    this.environment = this.environment.trim();
    this.keyId = this.keyId.trim();
    this.keyName = this.keyName.trim();
  }

  isNull() {
    return this.appId === undefined ||
      this.appId.trim().length === 0 ||
      this.keyId === undefined ||
      this.keyId.trim().length === 0 ||
      this.environment === undefined ||
      this.environment.length === 0;
  }

  isValid() {
    return this.environment !== undefined && 
      this.environment.trim().length > 0 && 
      this.keyId !== undefined &&  
      this.keyId.trim().length > 0;
  }
}

module.exports = AppEnvironment;
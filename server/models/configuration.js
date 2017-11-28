const uuid = require('uuid').v4;

class Configuration {
  constructor(obj) {
    var obj = obj || {};

    this.configurationId = obj.configurationId || uuid();
    this.teamId = obj.teamId || '';
    this.teamName = obj.teamName || '';
    this.appId = obj.appId || '';
    this.appName = obj.appName || '';
    this.appVersion = obj.appVersion;
    this.environment = obj.environment;
    this.configuration = obj.configuration;
    this.hasSecureItems = obj.hasSecureItems === true;
    this.comment = obj.comment || '';
    this.updated = obj.updated || new Date();
    this.updatedBy = obj.updatedBy || { userId: '', userName: '' };
    this.published = obj.published || false;
    this.key = obj.key;
    this.configurationHash = obj.configurationHash;

    this.appVersion = this.appVersion.trim();

    if (this.published === true) {
      this.publishedBy = obj.publishedBy || { userId: '', userName: '' };
    }
    else {
      this.publishedBy = undefined;
    }
  }

  isNull() {
    return this.appId === undefined ||
      this.appId.trim().length === 0 ||
      this.appVersion === undefined ||
      this.appVersion.trim().length === 0 ||
      this.environment === undefined ||
      this.environment.trim().length === 0;
  }

  isValid() {
    return /^[\d]{1,}.[\d]{1,}.[\d]{1,}$/.test(this.appVersion) &&
        this.appId !== undefined &&
        this.appId.trim().length > 0 &&
        this.environment !== undefined &&
        this.environment.trim().length > 0 &&
        this.configuration !== undefined &&
        Array.isArray(this.configuration);
  }
}

module.exports = Configuration;
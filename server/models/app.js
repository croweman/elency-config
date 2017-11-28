const uuid = require('uuid').v4;

class App {
  constructor(obj) {
    var obj = obj || {};

    this.appId = obj.appId || uuid();
    this.appName = obj.appName || '';
    this.description = obj.description;
    this.teamId = obj.teamId || '';
    this.teamName = obj.teamName || '';

    this.appId = this.appId.trim();
    this.appName = this.appName.trim();
    this.description = this.description.trim();
    this.teamId = this.teamId.trim();
    this.teamName = this.teamName.trim();
  }

  isNull() {
    return this.appId === undefined ||
      this.appId.trim().length === 0 ||
      this.appName === undefined ||
      this.appName.trim().length === 0 ||
      this.teamId === undefined ||
      this.teamId.trim().length === 0;
  }

  isValid() {
    return (/^[a-zA-Z0-9\_\-]+$/.test(this.appId) === true &&
      this.appName !== undefined && this.appName.trim().length > 0
      && this.description !== undefined);
  }
}

module.exports = App;
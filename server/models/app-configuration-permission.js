class AppConfigurationPermission {
  constructor(obj) {
    var obj = obj || {};

    this.id = obj.id;
    this.environment = obj.environment;
    this.read = obj.read;
    this.write = obj.write;
    this.publish = obj.publish;
  }

  isNull() {
    return this.id === undefined || this.id.trim().length === 0 ||
      this.environment === undefined || this.environment.trim().length === 0;
  }
}

module.exports = AppConfigurationPermission;
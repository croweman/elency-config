class ConfigRetrieval {
  constructor(obj) {
    var obj = obj || {};

    this.configurationId = obj.configurationId;
    this.retrieved = obj.retrieved || new Date();
    this.ip = obj.ip;
  }

  isNull() {
    return this.appId === undefined;
  }
}

module.exports = ConfigRetrieval;
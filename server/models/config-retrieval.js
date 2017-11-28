class ConfigRetrieval {
  constructor(obj) {
    var obj = obj || {};
    
    this.appId = obj.appId
    this.environment = obj.environment;
    this.retrieved = new Date();
    this.ip = obj.ip;
  }

  isNull() {
    return this.appId === undefined;
  }
}

module.exports = ConfigRetrieval;
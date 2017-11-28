const uuid = require('uuid').v4;

class Audit {
  constructor(obj) {
    var obj = obj || {};

    this.auditId = uuid();
    this.appId = obj.appId
    this.environment = obj.environment;
    this.appVersion = obj.appVersion;
    this.type = obj.type
    this.changed = new Date();
    this.changedBy = {
      userId: obj.userId,
      userName: obj.userName
    };
  }

  isNull() {
    return this.auditId === undefined;
  }
}

module.exports = Audit;
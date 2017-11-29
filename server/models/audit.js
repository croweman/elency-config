const uuid = require('uuid').v4;

class Audit {
  constructor(obj) {
    var obj = obj || {};

    this.auditId = obj.auditId || uuid();
    this.action = obj.action;
    this.data = obj.data || {};
    this.changed = obj.changed || new Date();
    this.changedBy = obj.changedBy || { userId: '', userName: '' };
  }

  isNull() {
    return this.auditId === undefined;
  }
}

module.exports = Audit;
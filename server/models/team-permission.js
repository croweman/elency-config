class TeamPermission {
  constructor(obj) {
    var obj = obj || {};

    this.id = obj.id;
    this.write = obj.write;
  }

  isNull() {
    return this.id === undefined || this.id.trim().length === 0;
  }
}

module.exports = TeamPermission;
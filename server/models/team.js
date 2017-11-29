const uuid = require('uuid').v4;

class Team {
  constructor(obj) {
    var obj = obj || {};

    this.teamId = obj.teamId || uuid();
    this.teamName = obj.teamName || '';
    this.description = obj.description || '';
    this.updated = obj.updated || new Date();
    this.updatedBy = obj.updatedBy || { userId: '', userName: '' };

    this.teamId = this.teamId.trim();
    this.teamName = this.teamName.trim();
    this.description = this.description.trim();
  }

  isNull() {
    return this.teamId === undefined ||
      this.teamId.trim().length === 0 ||
      this.teamName === undefined ||
      this.teamName.trim().length === 0;
  }

  isValid() {
    return (/^[a-zA-Z0-9\_\-]+$/.test(this.teamId) === true &&
    this.teamName !== undefined &&
    this.teamName.trim().length > 0 &&
    this.description !== undefined);
  }
}

module.exports = Team;
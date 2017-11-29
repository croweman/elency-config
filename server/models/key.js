const uuid = require('uuid').v4;

class Key {
  constructor(obj) {
    var obj = obj || {};

    this.keyId = obj.keyId || uuid();
    this.keyName = obj.keyName || '';
    this.description = obj.description || '';
    this.value = obj.value || '';
    this.updated = obj.updated || new Date();
    this.updatedBy = obj.updatedBy || { userId: '', userName: '' };
    this.keyId = this.keyId.trim();
    this.keyName = this.keyName.trim();
    this.description = this.description.trim();
    this.value = this.value.trim();
  }

  isNull() {
    return this.keyName === undefined;
  }

  isValid() {
    return (this.keyId !== undefined &&
      this.keyId.trim().length > 0 &&
      this.keyName !== undefined &&
      this.keyName.trim().length > 0 &&
      this.value !== undefined &&
      this.value.trim().length === 32);
  }
}

module.exports = Key;
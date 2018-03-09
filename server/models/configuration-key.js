class ConfigurationKey {
  constructor(obj) {
    var obj = obj || {};

    this.key = obj.key || '';
    this.value = obj.value;
    this.encrypted = obj.encrypted !== undefined && (obj.encrypted === true || obj.encrypted === 'true');
    this.key = this.key.trim();
  }

  isNull() {
    return this.key === undefined || this.key.trim().length === 0;
  }

  isValid() {
    return /^[a-zA-Z0-9_]+$/.test(this.key) && this.key.trim().length > 0;
  }
}

module.exports = ConfigurationKey;
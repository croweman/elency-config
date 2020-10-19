class Settings {
  constructor(obj) {
    var obj = obj || {};

    this.settingsId = obj.settingsId;

    this.ldapEnabled = obj.ldapEnabled || false;
    this.ldapUri = obj.ldapUri || '';
    this.ldapManagerDn = obj.ldapManagerDn || '';
    this.ldapManagerPassword = obj.ldapManagerPassword || '';
    this.ldapSearchBase = obj.ldapSearchBase || '';
    this.ldapSearchFilter = obj.ldapSearchFilter || '';
    this.updated = obj.updated || new Date();
    this.updatedBy = obj.updatedBy || { userId: '', userName: '' };
  }

  isNull() {
    return this.settingsId === undefined || this.settingsId.trim().length === 0;
  }

  isValid() {
    if (this.ldapEnabled === undefined || this.ldapEnabled === false) {
      return true;
    }
    
    return this.ldapUri !== undefined && this.ldapUri.length > 0 &&
      this.ldapManagerDn !== undefined && this.ldapManagerDn.length > 0 &&
      this.ldapManagerPassword !== undefined && this.ldapManagerPassword.length > 0 &&
      this.ldapSearchBase !== undefined && this.ldapSearchBase.length > 0 &&
      this.ldapSearchFilter !== undefined && this.ldapSearchFilter.length > 0;
  }
}

module.exports = Settings;
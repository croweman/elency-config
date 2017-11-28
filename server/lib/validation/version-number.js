const versionRegex = /^(\d+)\.(\d+).(\d+)$/;

module.exports = {
  validate: (versionNumber) => {
    return versionRegex.test(versionNumber);
  }
};
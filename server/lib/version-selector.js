const semver = require('semver');

function selectVersion(appVersion, versions) {
  if (!versions) {
    return undefined;
  }

  const filteredVersions = versions
    .sort(semver.compare)
    .filter((version) => {
      return semver.lte(version, appVersion);
    });

  if (filteredVersions.length > 0) {
    return filteredVersions[filteredVersions.length - 1];
  }

  return undefined;
}

module.exports = {
  selectVersion
};
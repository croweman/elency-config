const semver = require('semver');

function sortVersions(versions, descending = false) {
  let sortedVersions =  versions.sort(semver.compare);

  if (descending === true) {
    sortedVersions.reverse();
  }

  return sortedVersions;
}

module.exports = sortVersions;

const crypto = require('crypto');

async function hash(value) {

  return hashSync(value);
}

function hashSync(value) {

  return crypto
    .createHash('md5')
    .update(value)
    .digest("base64");
}

module.exports = {
  hash,
  hashSync
};
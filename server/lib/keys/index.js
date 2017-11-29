const crypto = require('crypto');
const uuid = require('uuid').v4;

function generateBase64Key(keyLength) {
  keyLength = keyLength || 32;
  let key = uuid().replace(/-/g, '');
  let base64Key = new Buffer(key).toString('base64');
  while (base64Key.length !== keyLength) {
    key = key.slice(0, -1);
    base64Key = new Buffer(key).toString('base64');
  }

  return base64Key;
}

function generateIV(keyLength) {
  keyLength = keyLength || 16;
  return crypto.randomBytes(keyLength).toString('hex').slice(0, keyLength);
}

module.exports = {
  generateBase64Key,
  generateIV
};
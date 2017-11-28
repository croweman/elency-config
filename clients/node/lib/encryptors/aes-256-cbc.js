const crypto = require('crypto'),
  algorithm = 'AES-256-CBC';

async function encrypt(value, password, iv) {
  const cipher = crypto.createCipheriv(algorithm, password, iv);
  let encrypted = cipher.update(value, 'utf8', 'hex')
  encrypted += cipher.final('hex');
  return [ encrypted, iv ];
}

async function decrypt(encrypted, password) {

  const content = encrypted[0];
  const iv = encrypted[1];

  const decipher = crypto.createDecipheriv(algorithm, password, iv);
  let dec = decipher.update(content, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

module.exports = {
  encrypt,
  decrypt
};
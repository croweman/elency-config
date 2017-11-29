'use strict';

const crypto = require('crypto'),
  fs = require('fs'),
  path = require('path'),
  debug = require('debug')('elency-config:rsa');

async function encrypt(value, relativeOrAbsolutePathToPublicKey) {
  const absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey);
  const publicKey = fs.readFileSync(absolutePath, "utf8");
  return crypto.publicEncrypt(publicKey, new Buffer(value)).toString("base64");
}

async function decrypt(value, relativeOrAbsolutePathToPrivateKey) {

  try {
    const absolutePath = path.resolve(relativeOrAbsolutePathToPrivateKey);
    const privateKey = fs.readFileSync(absolutePath, "utf8");
    return crypto.privateDecrypt(privateKey, new Buffer(value, "base64")).toString("utf8");
  }
  catch(err) {
    debug(`RSA authorization header decryption error: ${err}`);
    return 'elency-config:DecodingError';
  }
}

async function decryptFromPrivateKey(value, privateKey) {
  try {
    return crypto.privateDecrypt(privateKey, new Buffer(value, "base64")).toString("utf8");
  }
  catch(err) {
    debug(`RSA authorization header decryption error: ${err}`);
    return 'elency-config:DecodingError';
  }
}

module.exports = {
  encrypt,
  decrypt,
  decryptFromPrivateKey
};
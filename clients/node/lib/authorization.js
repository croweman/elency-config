'use strict';

const hasher = require('./hashers/hmac-sha256'),
  uuid = require('uuid').v4;

function getHeaderData(config, path, method) {
  const nonce = uuid();
  const timestamp = Date.now();
  const value = `${config.appId}${path.toLowerCase()}${method.toLowerCase()}${nonce}${timestamp}`;
  return {
    nonce,
    timestamp,
    value
  };
}

module.exports = {
  generateAuthorizationHeader: async function(config, path, method, hmac) {
    hmac = hmac || false;
    const headerData = getHeaderData(config, path, method);
    const key = (hmac === true ? config.HMACAuthorizationKey : config.configEncryptionKey);
    const signature = await hasher.hash(headerData.value, key);
    return `${config.appId}:${signature}:${headerData.nonce}:${headerData.timestamp}`;
  }
};
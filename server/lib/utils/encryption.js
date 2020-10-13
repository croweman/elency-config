const rsa = require('../encryptors/rsa'),
  aes256cbc = require('../encryptors/aes-256-cbc'),
  aes256ctr = require('../encryptors/aes-256-ctr'),
  hasher = require('../hashers/hmac-md5'),
  path = require('path'),
  { generateIV } = require('../keys');

module.exports = (elencyConfig) => {
  async function encryptConfiguration(configuration, exceptions) {
    exceptions = exceptions || [];

    const decryptionKey = await decryptKey(configuration.key);

    let config = JSON.stringify(configuration.configuration);
    const hash = await hasher.hash(`${configuration.configurationId}:${configuration.appVersion}:${config}`);

    for (let i = 0; i < configuration.configuration.length; i++) {
      let item = configuration.configuration[i];

      if (!item.encrypted) {
        continue;
      }

      if (exceptions.indexOf(configuration.configuration[i].key) !== -1) {
        continue;
      }

      const iv = generateIV();
      item.value = await aes256cbc.encrypt(item.value, decryptionKey.value, iv);
    }

    config = JSON.stringify(configuration.configuration);
    configuration.configurationHash = hash;

    let val = await aes256ctr.encrypt(config, elencyConfig.configEncryptionKey);
    configuration.configuration = val;
    return configuration;
  }

  async function decryptConfiguration(configuration) {
    let val = await aes256ctr.decrypt(configuration.configuration, elencyConfig.configEncryptionKey);
    configuration.configuration = JSON.parse(val);
    return configuration;
  }

  async function encryptConfigurationWithKey(configuration) {
    const decryptionKey = await decryptKey(configuration.key);
    const iv = generateIV();
    configuration.configuration = await aes256cbc.encrypt(JSON.stringify(configuration.configuration), decryptionKey.value, iv);
    return configuration;
  }

  async function encryptKey(key) {
    let encryptedKey = Object.assign({}, key);
    encryptedKey.value = await rsa.encrypt(key.value, path.join(__dirname, '../../sec/elency-config.public.pem'));
    return encryptedKey;
  }

  async function decryptKey(key) {
    let decryptedKey = Object.assign({}, key);
    decryptedKey.value = await rsa.decrypt(key.value, path.join(__dirname, '../../sec/elency-config.private.pem'));
    return decryptedKey;
  }

  async function encrypt(value) {
    return await rsa.encrypt(value, path.join(__dirname, '../../sec/elency-config.public.pem'));
  }

  async function decrypt(value) {
    return await rsa.decrypt(value, path.join(__dirname, '../../sec/elency-config.private.pem'));
  }

  function base64Encode(value) {
    return Buffer.from(value).toString('base64')
  }

  function base64Decode(value) {
    return Buffer.from(value, 'base64').toString('ascii');
  }
  
  return {
    encryptConfiguration,
    decryptConfiguration,
    encryptConfigurationWithKey,
    encryptKey,
    decryptKey,
    encrypt,
    decrypt,
    base64Encode,
    base64Decode
  };
};
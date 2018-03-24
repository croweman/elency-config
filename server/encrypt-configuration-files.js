/*
 Script can be executed with the following environment variables and arguments:

 Environment variables:

 - CONFIG_FOLDER_PATH: (optional) The folder containing the config.json and keys.json configuration files
 - SEC_FOLDER_PATH: (optional) The folder containing the elency-config.private.pem and elency-config.public.pe files

 Arguments:

 - -d: Defines whether configuration files (config.json and keys.json) should be decrypted, default is false.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const hexIV = '5d71d70367921ad4c35644c6cf451a3c';
const iv = Buffer.from(hexIV, 'hex').slice(0, 16);
const decrypt = (process.argv.length === 3 && process.argv[2] === '-d');
const configFolderPath = getFolderPath('CONFIG_FOLDER_PATH', './config/');
const secFolderPath = getFolderPath('SEC_FOLDER_PATH', './sec/');
const configJSONFilePath = path.join(__dirname, configFolderPath + 'config.json');
const keysJSONFilePath = path.join(__dirname, configFolderPath + 'keys.json');
const privatePemFilePath = path.join(__dirname, secFolderPath + 'elency-config.private.pem');
const publicPemFilePath = path.join(__dirname, secFolderPath + 'elency-config.public.pem');

process.on('uncaughtException', function(err) {
  console.log('Unhandled exception', err);
  process.exit(1);
});

const configJSONContent = fs.readFileSync(configJSONFilePath);
const keysJSONContent = fs.readFileSync(keysJSONFilePath);

if (decrypt) {
  let decryptedKeysContent = rsaDecrypt(keysJSONContent.toString('utf8'), privatePemFilePath);
  decryptedKeysContent = decryptedKeysContent;
  const prettifiedKeys = JSON.stringify(JSON.parse(decryptedKeysContent), null, 2);
  fs.writeFileSync(keysJSONFilePath, prettifiedKeys);
  const keys = JSON.parse(decryptedKeysContent);
  const decryptedConfigJSON = aes256ctrDecrypt(configJSONContent.toString(), keys.configEncryptionKey);
  const prettifiedConfig = JSON.stringify(JSON.parse(decryptedConfigJSON), null, 2);
  fs.writeFileSync(configJSONFilePath, prettifiedConfig);
  console.log('Decryption complete');
}
else {
  const elencyConfig = JSON.parse(configJSONContent);
  const keys = JSON.parse(keysJSONContent);
  const keysContent = JSON.stringify(keys);
  const encryptedKeysContent = rsaEncrypt(keysContent, publicPemFilePath);
  fs.writeFileSync(keysJSONFilePath, encryptedKeysContent);
  const config = JSON.stringify(elencyConfig);
  const encryptedConfig = aes256ctrEncrypt(config, keys.configEncryptionKey);
  fs.writeFileSync(configJSONFilePath, encryptedConfig);
  console.log('Encryption complete');
}

function rsaEncrypt(value, relativeOrAbsolutePathToPublicKey) {
  const absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey);
  const publicKey = fs.readFileSync(absolutePath, "utf8");
  return crypto.publicEncrypt(publicKey, new Buffer(value)).toString("base64");
}

function rsaDecrypt(value, relativeOrAbsolutePathToPrivateKey) {
  const absolutePath = path.resolve(relativeOrAbsolutePathToPrivateKey);
  const privateKey = fs.readFileSync(absolutePath, "utf8");
  return crypto.privateDecrypt(privateKey, new Buffer(value, "base64")).toString("utf8");
}

function aes256ctrEncrypt(value, password){
  const cipher = crypto.createCipheriv(algorithm, password, iv);
  let crypted = cipher.update(value, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

function aes256ctrDecrypt(value, password){
  const decipher = crypto.createDecipheriv(algorithm, password, iv);
  let dec = decipher.update(value, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

function getFolderPath(environmentVariable, fallback) {
  let folderPath = (typeof process.env[environmentVariable] === 'string' ? process.env[environmentVariable] : fallback);

  if (!folderPath.endsWith('/')) {
    folderPath += '/';
  }

  return folderPath;
}
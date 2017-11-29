const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const algorithm = 'aes-256-ctr';
const hexIV = '5d71d70367921ad4c35644c6cf451a3c';
const iv = Buffer.from(hexIV, 'hex').slice(0, 16);

let CONFIG_FOLDER_PATH = (typeof process.env['CONFIG_FOLDER_PATH'] === 'string' ? process.env['CONFIG_FOLDER_PATH'] : './config/');
let SEC_FOLDER_PATH = (typeof process.env['SEC_FOLDER_PATH'] === 'string' ? process.env['SEC_FOLDER_PATH'] : './sec/');

if (!CONFIG_FOLDER_PATH.endsWith('/')) {
  CONFIG_FOLDER_PATH += '/';
}

if (!SEC_FOLDER_PATH.endsWith('/')) {
  SEC_FOLDER_PATH += '/';
}

const elencyConfig = JSON.parse(fs.readFileSync(path.join(__dirname, CONFIG_FOLDER_PATH + 'config.json')));
const keys = JSON.parse(fs.readFileSync(path.join(__dirname, CONFIG_FOLDER_PATH + 'keys.json')));
const keysContent = JSON.stringify(keys);

rsaEncrypt(keysContent, path.join(__dirname, SEC_FOLDER_PATH + 'elency-config.public.pem'))
  .then((enc) => {
    fs.writeFileSync(path.join(__dirname, SEC_FOLDER_PATH + 'keys.json'), enc);

    const content = JSON.stringify(elencyConfig);

    aes256ctrEncrypt.encrypt(content, keys.configEncryptionKey)
      .then((enc) => {
        fs.writeFileSync(path.join(__dirname, CONFIG_FOLDER_PATH + 'config.json'), enc);
      });
  });

async function rsaEncrypt(value, relativeOrAbsolutePathToPublicKey) {
  const absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey);
  const publicKey = fs.readFileSync(absolutePath, "utf8");
  return crypto.publicEncrypt(publicKey, new Buffer(value)).toString("base64");
}


async function aes256ctrEncrypt(value, password){
  const cipher = crypto.createCipheriv(algorithm, password, iv);
  let crypted = cipher.update(value, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}
const fs = require('fs');
const path = require('path');
const exec = require('child_process').execSync;

const rsa = require('../../server/lib/encryptors/rsa');
const aes256ctr = require('../../server/lib/encryptors/aes-256-ctr');

const createData = process.env.CREATE_CONFIG_DATA === 'true';

if (!createData) {
  return;
}

exec('openssl genrsa -out ./server/sec/elency-config.private.pem 2048');
exec('openssl rsa -in ./server/sec/elency-config.private.pem -outform PEM -pubout -out ./server/sec/elency-config.public.pem');

const elencyConfig = {
  mongoUrl: 'mongodb://localhost:27017/elency-config',
  HMACAuthorizationKey: 'YWJlZjYwNzQwYzk4NDY4Zjg3ZTg5MWU0',
  exposeUIRoutes: true
};

let keys = {
  configEncryptionKey: 'M2VlMzRiOTFiNmM0NDY2YWI0MTAxZmZi'
};

let keysContent = JSON.stringify(keys);

rsa.encrypt(keysContent, path.join(__dirname, '../../server/sec/elency-config.public.pem'))
  .then((enc) => {
    fs.writeFileSync(path.join(__dirname, '../../server/config/keys.json'), enc);

    let content = JSON.stringify(elencyConfig);
    aes256ctr.encrypt(content, keys.configEncryptionKey)
      .then((enc) => {
          fs.writeFileSync(path.join(__dirname, '../../server/config/config.json'), enc);
      });
  });
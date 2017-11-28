const crypto = require('crypto');
const expect = require('chai').expect;

const aes256cbc = require('../../../../lib/encryptors/aes-256-cbc');

const Encryption = require('../../../../lib/utils/encryption'),
  models = require('../../../../models');

describe('utils - encryption', () => {

  let encryptionInstance;
  let configEncryptionKey = 'th15154p455w0rd!th15154p455w0rd!';

  before(() => {
    encryptionInstance = Encryption({
      configEncryptionKey
    });
  });

  describe('encryptConfiguration and decryptConfiguration', () => {

    it('correctly encrypts and decrypts a configuration', async () => {

      const configurationKey1 = new models.configurationKey({
        key: 'KeyOne',
        value: 'KeyOneValue',
        encrypted: false
      });

      const iv = crypto.randomBytes(16).toString('hex').slice(0, 16);

      const configurationKey2 = new models.configurationKey({
        key: 'KeyTwo',
        value: 'KeyTwoValue',
        encrypted: true,
        iv
      });

      const configuration = new models.configuration({
        appId: 'app-awesome',
        appVersion: '1.1.1',
        environment: 'production',
        configuration: [
          configurationKey1,
          configurationKey2
        ]
      });

      let key = await encryptionInstance.encryptKey(new models.key({
        keyId: 'awesomeappkey',
        keyName: 'app-awesome-key',
        description: 'a description',
        value: 'th15154p455w0rd!th15154p455w0rd!'
      }));

      configuration.key = key;
      let updatedConfiguration = await encryptionInstance.encryptConfiguration(configuration);

      let config = updatedConfiguration.configuration;
      expect(typeof config).to.eql('string');
      expect(updatedConfiguration.configurationHash.length > 0).to.equal(true);

      updatedConfiguration = await encryptionInstance.decryptConfiguration(configuration);

      config = updatedConfiguration.configuration;
      expect(typeof config).to.eql('object');
      expect(config.length).to.eql(2);
      
      expect(config[0].key).to.eql('KeyOne');
      expect(config[0].value).to.eql('KeyOneValue');
      expect(config[0].encrypted).to.eql(false);
      expect(!config[0].iv).to.eql(true);

      expect(config[1].key).to.eql('KeyTwo');
      expect(config[1].encrypted).to.eql(true);
      expect(config[1].value.length > 0).to.eql(true);

      key = await encryptionInstance.decryptKey(key);

      let val = await aes256cbc.decrypt(config[1].value, key.value);
      expect(val).to.equal('KeyTwoValue');
    });

  });

  describe('encryptKey and decryptKey', () => {
    it('correctly encrypts and decrypts a Key', async () => {

      const keyValue = 'th15154p455w0rd!th15154p455w0rd!aa';

      let key = new models.key({
        keyId: 'awesomeappkey',
        keyName: 'app-awesome-key',
        description: 'a description',
        value: keyValue
      });

      key = await encryptionInstance.encryptKey(key);

      expect(key.value).to.not.eql(keyValue);

      key = await encryptionInstance.decryptKey(key);

      expect(key.value).to.eql(keyValue);
    });
  });
});
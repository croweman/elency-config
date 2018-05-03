const expect = require('chai').expect;
const uuid = require('uuid').v4;
const constants = require('../../../../server/lib/constants');
const hasher = require('../../../../server/lib/hashers/hmac-sha256');
const models = require('../../../../server/models');
const repositories = require('../../../../server/lib/repositories');
const encryption = require('../../../../server/lib/utils/encryption');
const ElencyConfigNode = require('../../../../clients/node');

describe('node client and node server acceptance tests', () => {

  const teamId = 'awesome-team';
  const teamName = 'awesome team';
  const appId = 'awesome-micro-service';
  const appName = 'awesome micro service';
  const environment = 'production';
  const elencyConfigUserId = '129bb9ca-afe9-11e7-abc4-cec278b6b50a';
  const roleId = 'f667c22a-af7e-4733-ab15-31540686372c';

  const elencyConfig = {
    mongoUrl: 'mongodb://localhost:27017/elency-config',
    HMACAuthorizationKey: 'YWJlZjYwNzQwYzk4NDY4Zjg3ZTg5MWU0',
    configEncryptionKey: 'M2VlMzRiOTFiNmM0NDY2YWI0MTAxZmZi'
  };

  const keyEncryptionKey = 'ZTk0YTU5YjNhMjk4NGI3NmIxNWExNzdi';

  let repos;
  let enc;
  let configuration;
  let key;
  let configurationKey2;

  function sleep(duration) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, duration);
    });
  }

  async function createTestData() {
    await sleep(1000);

    repos = await repositories(elencyConfig);
    enc = await encryption(elencyConfig);

    await repos.app.removeAll();
    await repos.appEnvironment.removeAll();
    await repos.audit.removeAll();
    await repos.key.removeAll();
    await repos.configuration.removeAll();
    await repos.configRetrieval.removeAll();
    await repos.team.removeAll();
    await repos.token.removeAll();
    await repos.user.removeAll();
    await repos.settings.removeAll();
    await repos.role.removeAll();


    let adminUser = new models.user({
      userId: constants.adminUserId,
      userName: 'admin',
      password: 'aA1!aaaa',
      enabled: true,
      roles: [ constants.roleIds.administrator ],
      teamPermissions: [],
      appConfigurationPermissions: []
    });

    adminUser.password = adminUser.getHashedPassword(hasher, adminUser.password, elencyConfig.configEncryptionKey);
    await repos.user.add(adminUser);

    let elencyConfigUser = new models.user({
      userId: elencyConfigUserId,
      userName: 'elencyConfig',
      password: 'bB1!bbbb',
      enabled: true,
      roles: [ constants.roleIds.administrator, constants.roleIds.teamWriter, constants.roleIds.keyWriter, roleId ],
      teamPermissions: [
        new models.teamPermission({
          id: teamId,
          write: true
        })
      ],
      appConfigurationPermissions: [
        new models.appConfigurationPermission({
          id: appId,
          environment: environment,
          read: true,
          write: true,
          publish: false,
        })
      ]
    });
    
    elencyConfigUser.password = elencyConfigUser.getHashedPassword(hasher, elencyConfigUser.password, elencyConfig.configEncryptionKey);
    await repos.user.add(elencyConfigUser);

    let role = new models.role({
      roleId,
      roleName: 'awesome role',
      enabled: true,
      teamPermissions: [
        new models.teamPermission({
          id: teamId,
          write: true
        })
      ],
      appConfigurationPermissions: [
        new models.appConfigurationPermission({
          id: appId,
          environment: environment,
          read: true,
          write: true,
          publish: true
        })
      ]
    });

    await repos.role.add(role);

    let settings = new models.settings({
      settingsId: uuid(),
      ldapEnabled: true,
      ldapUri: 'ldap://localhost:3001',
      ldapManagerDn: 'cn=Bob Smith,dc=test,dc=com',
      ldapManagerPassword: 'f178hJ4$a!',
      ldapSearchBase: 'DC=test,DC=com',
      ldapSearchFilter: '(sAMAccountName={0})'
    });

    settings.ldapManagerPassword = await enc.encrypt(settings.ldapManagerPassword);
    await repos.settings.add(settings);


    let team = new models.team({
      teamId,
      teamName,
      description: 'the awesome team'
    });

    await repos.team.add(team);

    let app = new models.app({
      appId,
      appName,
      description: 'its frickin awesome',
      teamId,
      teamName
    });

    await repos.app.add(app);

    key = new models.key({
      keyId: uuid(),
      keyName: 'awesome key',
      description: 'the awesome key',
      value: keyEncryptionKey,
      updated: new Date(),
      updatedBy: { userId: elencyConfigUser.userId, userName: elencyConfigUser.userName }
    });

    key = await enc.encryptKey(key);

    await repos.key.add(key);

    let appEnvironment = new models.appEnvironment({
      appId,
      appName,
      teamId,
      teamName,
      environment,
      keyId: key.keyId,
      keyName: key.keyName,
      versions: ['1.1.1'],
      allVersions: ['1.1.1', '1.1.0']
    });

    await repos.appEnvironment.add(appEnvironment);

    let configurationKey1 = new models.configurationKey({
      key: 'KeyOne',
      value: 'KeyOneValue',
      encrypted: false
    });

    configurationKey2 = new models.configurationKey({
      key: 'KeyTwo',
      value: 'KeyTwoValue',
      encrypted: true
    });

    let configurationKey3 = new models.configurationKey({
      key: 'KeyThree',
      value: 'KeyThreeValueYeh',
      encrypted: true
    });

    configuration = new models.configuration({
      appId,
      appName,
      teamId,
      teamName,
      appVersion: '1.1.1',
      environment: environment,
      published: true,
      configuration: [
        configurationKey1,
        configurationKey2
      ],
      updated: new Date(),
      updatedBy: { userId: elencyConfigUser.userId, userName: elencyConfigUser.userName },
      publishedBy: { userId: elencyConfigUser.userId, userName: elencyConfigUser.userName },
      hasSecureItems: true
    });

    configuration.key = { keyId: key.keyId, value: key.value };

    configuration = await enc.encryptConfiguration(configuration);

    await repos.configuration.add(configuration);

    configurationKey2 = new models.configurationKey({
      key: 'KeyTwo',
      value: 'KeyTwoValue',
      encrypted: true
    });

    let configuration2 = new models.configuration({
      appId,
      appName,
      teamId,
      teamName,
      appVersion: '1.1.0',
      environment: environment,
      published: false,
      configuration: [
        configurationKey1,
        configurationKey2,
        configurationKey3
      ],
      updated: new Date(),
      updatedBy: { userId: elencyConfigUser.userId, userName: elencyConfigUser.userName },
      hasSecureItems: true
    });

    configuration2.key = { keyId: key.keyId, value: key.value };

    configuration2 = await enc.encryptConfiguration(configuration2);

    await repos.configuration.add(configuration2);
  }

  before(async () => {
    await createTestData();
    await sleep(1000);
  });

  describe('Initialising a node client with valid data', () => {

    let elencyConfigNode;

    before(async () => {
      elencyConfigNode = ElencyConfigNode({
        uri: 'http://localhost:3000',
        appId,
        appVersion: '1.1.1',
        environment,
        refreshInterval: 3000,
        HMACAuthorizationKey: elencyConfig.HMACAuthorizationKey,
        configEncryptionKey: keyEncryptionKey,
        retrieved: async () => {
          console.log('** RETRIEVED CONFIG **');
        },
        refreshFailure: () => {
          console.log('** REFRESH FAILURE CONFIG **');
        }
      });

      await elencyConfigNode.init();
      
    });

    it('successfully receives configuration from the elency-config server', async () => {
      const keys = elencyConfigNode.getAllKeys();

      expect(keys.length).to.eql(2);
      expect(elencyConfigNode.get('KeyOne')).to.eql('KeyOneValue');
      expect(elencyConfigNode.get('KeyTwo')).to.eql('KeyTwoValue');
      expect(elencyConfigNode.appVersion).to.eql('1.1.1');
      expect(elencyConfigNode.environment).to.eql('production');
    });

    it('successfully receives updated configuration from the elency-config server based on a refresh interval', async () => {

      configurationKey2 = new models.configurationKey({
        key: 'KeyTwo',
        value: 'KeyTwoValueUpdated',
        encrypted: true
      });

      let configurationKey3 = new models.configurationKey({
        key: 'KeyThree',
        value: 'KeyThreeValue',
        encrypted: false
      });

      configuration = await enc.decryptConfiguration(configuration);
      configuration.configuration[1] = configurationKey2;
      configuration.configuration.push(configurationKey3);
      configuration.configurationId = uuid();
      configuration.updated = new Date();
      delete configuration._id;

      configuration = await enc.encryptConfiguration(configuration);
      await repos.configuration.add(configuration);

      await sleep(4000);

      const keys = elencyConfigNode.getAllKeys();

      expect(keys.length).to.eql(3);

      expect(elencyConfigNode.get('KeyOne')).to.eql('KeyOneValue');
      expect(elencyConfigNode.get('KeyTwo')).to.eql('KeyTwoValueUpdated');
      expect(elencyConfigNode.get('KeyThree')).to.eql('KeyThreeValue');
      expect(elencyConfigNode.appVersion).to.eql('1.1.1');
      expect(elencyConfigNode.environment).to.eql('production');
    });

  });

  describe('Initialising a node client with valid data and smaller version number 1.0.1', () => {

    let elencyConfigNode;

    before(async () => {
      elencyConfigNode = ElencyConfigNode({
        uri: 'http://localhost:3000',
        appId,
        appVersion: '1.0.1',
        environment,
        refreshInterval: 3000,
        HMACAuthorizationKey: elencyConfig.HMACAuthorizationKey,
        configEncryptionKey: keyEncryptionKey,
        retrieved: async () => {
          console.log('** RETRIEVED CONFIG **');
        },
        refreshFailure: () => {
          console.log('** REFRESH FAILURE CONFIG **');
        }
      });

    });

    it('errors as configuration does not exist on the elency-config server', async () => {

      try {
        await elencyConfigNode.init();
        throw 'should not have got here';
      }
      catch (err) {
        if (err.toString().indexOf('should not have got here') !== -1)
          throw err;

        expect(err.toString()).to.eql('Error: An error occurred while trying to retrieve the configuration');
      }
    });

  });

  describe('Initialising a node client with valid data and greater version number 1.2.4', () => {

    let elencyConfigNode;

    before(async () => {
      elencyConfigNode = ElencyConfigNode({
        uri: 'http://localhost:3000',
        appId,
        appVersion: '1.2.4',
        environment,
        refreshInterval: 3000,
        HMACAuthorizationKey: elencyConfig.HMACAuthorizationKey,
        configEncryptionKey: keyEncryptionKey,
        retrieved: async () => {
          console.log('** RETRIEVED CONFIG **');
        },
        refreshFailure: () => {
          console.log('** REFRESH FAILURE CONFIG **');
        }
      });

      await elencyConfigNode.init();

    });

    it('successfully receives configuration from the elency-config server for version 1.1.1', async () => {
      const keys = elencyConfigNode.getAllKeys();

      expect(keys.length).to.eql(3);
      expect(elencyConfigNode.get('KeyOne')).to.eql('KeyOneValue');
      expect(elencyConfigNode.get('KeyTwo')).to.eql('KeyTwoValueUpdated');
      expect(elencyConfigNode.get('KeyThree')).to.eql('KeyThreeValue');
      expect(elencyConfigNode.appVersion).to.eql('1.1.1');
      expect(elencyConfigNode.environment).to.eql('production');
    });

  });

  describe('Initialising a node client with invalid environment', () => {

    let elencyConfigNode;

    before(async () => {
      elencyConfigNode = ElencyConfigNode({
        uri: 'http://localhost:3000',
        appId,
        appVersion: '1.1.1',
        environment: 'test',
        refreshInterval: 3000,
        HMACAuthorizationKey: elencyConfig.HMACAuthorizationKey,
        configEncryptionKey: keyEncryptionKey,
        retrieved: async () => {
          console.log('** RETRIEVED CONFIG **');
        },
        refreshFailure: () => {
          console.log('** REFRESH FAILURE CONFIG **');
        }
      });
    });

    it('errors as configuration does not exist on the elency-config server', async () => {
      try {
        await elencyConfigNode.init();
        throw 'should not have got here';
      }
      catch (err) {
        if (err.toString().indexOf('should not have got here') !== -1)
          throw err;

        expect(err.toString()).to.eql('Error: An error occurred while trying to retrieve the configuration');
      }
    });

  });

  describe('Initialising a node client with non existent appId', () => {

    let elencyConfigNode;

    before(async () => {
      elencyConfigNode = ElencyConfigNode({
        uri: 'http://localhost:3000',
        appId: 'fishApp',
        appVersion: '1.1.1',
        environment,
        refreshInterval: 3000,
        HMACAuthorizationKey: elencyConfig.HMACAuthorizationKey,
        configEncryptionKey: keyEncryptionKey,
        retrieved: async () => {
          console.log('** RETRIEVED CONFIG **');
        },
        refreshFailure: () => {
          console.log('** REFRESH FAILURE CONFIG **');
        }
      });
    });

    it('errors as configuration does not exist on the elency-config server', async () => {
      try {
        await elencyConfigNode.init();
        throw 'should not have got here';
      }
      catch (err) {
        if (err.toString().indexOf('should not have got here') !== -1)
          throw err;

        expect(err.toString()).to.eql('Error: An error occurred while trying to retrieve the configuration');
      }
    });

  });

  describe('Initialising a node client with invalid HMACAuthorizationKey', () => {

    let elencyConfigNode;

    before(async () => {
      elencyConfigNode = ElencyConfigNode({
        uri: 'http://localhost:3000',
        appId,
        appVersion: '1.1.1',
        environment,
        refreshInterval: 3000,
        HMACAuthorizationKey: elencyConfig.HMACAuthorizationKey.substr(0, elencyConfig.HMACAuthorizationKey.length - 1) + 'z',
        configEncryptionKey: keyEncryptionKey,
        retrieved: async () => {
          console.log('** RETRIEVED CONFIG **');
        },
        refreshFailure: () => {
          console.log('** REFRESH FAILURE CONFIG **');
        }
      });
    });

    it('errors as the authorization token is not valid on the elency-config server', async () => {
      try {
        await elencyConfigNode.init();
        throw 'should not have got here';
      }
      catch (err) {
        if (err.toString().indexOf('should not have got here') !== -1)
          throw err;

        expect(err.toString()).to.eql('Error: An error occurred while trying to retrieve an x-access-token');
      }
    });

  });

  describe('Initialising a node client with invalid configEncryptionKey', () => {

    let elencyConfigNode;

    before(async () => {
      elencyConfigNode = ElencyConfigNode({
        uri: 'http://localhost:3000',
        appId,
        appVersion: '1.1.1',
        environment,
        refreshInterval: 3000,
        HMACAuthorizationKey: elencyConfig.HMACAuthorizationKey,
        configEncryptionKey: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        retrieved: async () => {
          console.log('** RETRIEVED CONFIG **');
        },
        refreshFailure: () => {
          console.log('** REFRESH FAILURE CONFIG **');
        }
      });
    });

    it('errors as the configuration cannot be retrieved', async () => {
      try {
        await elencyConfigNode.init();
        throw 'should not have got here';
      }
      catch (err) {
        expect(err.toString()).to.eql('Error: An error occurred while trying to retrieve the configuration');
      }
    });

  });

});
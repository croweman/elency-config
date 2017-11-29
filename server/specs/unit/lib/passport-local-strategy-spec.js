const repositories = require('../../../lib/repositories'),
  models = require('../../../models'),
  passportLocalStrategy = require('../../../lib/passport-local-strategy'),
  hasher = require('../../../lib/hashers/hmac-sha256'),
  encryption = require('../../../../server/lib/utils/encryption'),
  uuid = require('uuid').v4,
  expect = require('chai').expect,
  constants = require('../../../lib/constants');

let ldapMockServer;
let repos;
let enc;
let strategy;
let elencyConfigUser;
let adminUser;

describe('passport-local-strategy',() => {

  const elencyConfig = {
    mongoUrl: 'mongodb://localhost:27017/elency-config',
    HMACAuthorizationKey: 'th15154p455w0rd!th15154p455w0rd*',
    configEncryptionKey: 'th15154p455w0rd!th15154p455w0rd!'
  };

  const joeBloggsUserId = '26271726-1c91-48e5-ac40-70875d509cc5';

  function waitForLDAPServer() {
    return new Promise((resolve) => {
      let interval = setInterval(() => {
        if (ldapMockServer.listening() === true) {
          clearInterval(interval);
          return resolve();
        }
      }, 10);
    });
  }

  before(async () => {
    ldapMockServer = require('../../support/ldap-mock-server');
    await waitForLDAPServer();

    repos = await repositories(elencyConfig);
    await repos.user.removeAll();

    elencyConfigUser = new models.user({
      userId: joeBloggsUserId,
      userName: 'joe.bloggs',
      password: 'aA1!aaaa',
      enabled: true,
      roles: [ constants.roleIds.administrator, constants.roleIds.teamWriter, constants.roleIds.keyWriter ],
      teamPermissions: [],
      appConfigurationPermissions: []
    });

    elencyConfigUser.password = hasher.hashSync(elencyConfigUser.password, elencyConfig.configEncryptionKey);
    elencyConfigUser.password = hasher.hashSync(elencyConfigUser.password, elencyConfigUser.salt);

    await repos.user.add(elencyConfigUser);

    adminUser = new models.user({
      userId: constants.adminUserId,
      userName: 'admin',
      password: 'aA1!aaaa',
      enabled: true,
      roles: [ constants.roleIds.administrator ],
      teamPermissions: [],
      appConfigurationPermissions: []
    });

    adminUser.password = hasher.hashSync(adminUser.password, elencyConfig.configEncryptionKey);
    adminUser.password = hasher.hashSync(adminUser.password, adminUser.salt);
    await repos.user.add(adminUser);

    enc = await encryption(elencyConfig);
    strategy = passportLocalStrategy(repos, enc, elencyConfig);
  });

  after(() => {
    ldapMockServer.stop();
  });

  describe('when ldapEnabled is enabled', () => {

    beforeEach(async () => {
      await repos.settings.removeAll();

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
    });

    describe('authentication succeeds', () => {

      it('when valid LDAP and mongo user provided', (done) => {
        strategy._verify('joe.bloggs', 'aA1!aaaa', (err, user, message) => {
          expect(err).to.eql(null);
          expect(user.userName).to.eql('joe.bloggs');
          done();
        });
      });
    });

    describe('authentication fails', () => {

      it('when invalid LDAP user', (done) => {
        strategy._verify('unknown.user', elencyConfigUser.password, (err, user, message) => {
          expect(err).to.eql(null);
          expect(user).to.eql(false);
          expect(message.message).to.eql('Unknown user unknown.user');
          done();
        });
      });

      it('when valid LDAP user but invalid mongo user', (done) => {
        strategy._verify('bob.smith', 'f178hJ4$a!', (err, user, message) => {
          expect(err).to.eql(null);
          expect(user).to.eql(false);
          expect(message.message).to.eql('Unknown user bob.smith');
          done();
        });
      });

      describe('when invalid LDAP URL', () => {
        beforeEach(async () => {
          await repos.settings.removeAll();

          let settings = new models.settings({
            settingsId: uuid(),
            ldapEnabled: true,
            ldapUri: 'ldap://localhost:3002',
            ldapManagerDn: 'cn=Bob Smith,dc=test,dc=com',
            ldapManagerPassword: 'f178hJ4$a!',
            ldapSearchBase: 'DC=test,DC=com',
            ldapSearchFilter: '(sAMAccountName={0})'
          });

          settings.ldapManagerPassword = await enc.encrypt(settings.ldapManagerPassword);
          await repos.settings.add(settings);
        });

        it('authentication fails', (done) => {
          strategy._verify(elencyConfigUser.userName, elencyConfigUser.password, (err, user, message) => {
            expect(err).to.eql(null);
            expect(user).to.eql(false);
            expect(message.message).to.eql('Unexpected error, check whether LDAP connectivity settings are invalid');
            done();
          });
        });
      })
    });

  });

  describe('when ldapEnabled is disabled', () => {

    beforeEach(async () => {
      await repos.settings.removeAll();

      let settings = new models.settings({
        settingsId: uuid(),
        ldapEnabled: false,
        ldapUri: 'ldap://localhost:3001',
        ldapManagerDn: 'cn=Bob Smith,dc=test,dc=com',
        ldapManagerPassword: 'f178hJ4$a!',
        ldapSearchBase: 'DC=test,DC=com',
        ldapSearchFilter: '(sAMAccountName={{{0}}})'
      });

      settings.ldapManagerPassword = await enc.encrypt(settings.ldapManagerPassword);
      await repos.settings.add(settings);
    });

    describe('authentication succeeds', () => {

      it('when valid admin mongo user provided', (done) => {
        strategy._verify(adminUser.userName, 'aA1!aaaa', (err, user, message) => {
          expect(err).to.eql(null);
          expect(user.userName).to.eql('admin');
          done();
        });
      });
    });

    describe('authentication fails', () => {

      it('when invalid mongo user provided', (done) => {
        strategy._verify('bob.smith', elencyConfigUser.password, (err, user, message) => {
          expect(err).to.eql(null);
          expect(user).to.eql(false);
          expect(message.message).to.eql('Unknown user bob.smith');
          done();
        });
      });

      it('when valid mongo user provided with invalid password', (done) => {
        strategy._verify(elencyConfigUser.userName, elencyConfigUser.password, (err, user, message) => {
          expect(err).to.eql(null);
          expect(user).to.eql(false);
          expect(message.message).to.eql('Invalid password');
          done();
        });
      });

    });

  });

});
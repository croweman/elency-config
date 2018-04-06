'use strict';

const elencyConfig = require('../../'),
  expect = require('chai').expect,
  nock = require('nock'),
  hasher = require('../../lib/hashers/hmac-sha256');

const encryptionKey = 'NTY4dUppMWEyQDM0NThqaGhGYSFhYQ==';
const HMACAuthorizationKey = 'MzY4dUBKaTFhMjM0ODIxamhoRmEhYWE=';

const validConfigurationBody = {
  appId: 'proj',
  appVersion: '1.1.1',
  environment: 'prod',
  configurationId: '9b386d19-fa7a-40ba-b794-f961e56ffe07',
  configuration: [ '00f42afad19c178194b55ccbde31b6aabd076853091b1f5ec1d32b0b1f10663373bf67554ed6dbce1af719ffc023badfe7df6a81329621546bf42539341e61e7350839b4642787b4de0bf041a6e151e91b77ebce8d1d3cc841dfc266382c5855c1b4a06ab5c49ed9e938af4fdb1f8d0a48e1013e4cc3eac1260041c090655692f9e28a23bb5a542bd6eb794ad08359ced7988eb6ec272b98300468e6cc079a90',
    '5fd084ba85e916cz' ],
  configurationHash: 'Re10aakOhCrz488W6ws5/A==',
};

const validConfigurationBody2 = {
  appId: 'proj',
  appVersion: '1.1.1',
  environment: 'prod',
  configuration: [ 'b1ea4b95f64e0f73b9fee6daa4168dd3edced7b517359a83fe935a96d8cf7a1d9ac4593fa6890a7e2b4a275bd03e944d17b2e441532ad56e93f9b292def9dd07421d5d5dcdf14d8f662cd65d681f7e0000b006f535aad57180b45503efb659108b953aad8055cbd6c6b69b56590facb65f80f4cb8f0c0c083c603ee7ac18eb033015d4176b9557fffb91925f2a939a836c6d3d15b17640dd6e1f6fa53ea5325ba828822ce84cb6a50e140a13d14e3105acbd216351772a7e82b4380bd9a8ef4dd7722b33b7a113b6be328b73f36abd9e446995fb3fc38961c293d9d9a18e99f8757506167d99cb389beb8f44f05d050b12129fb799f4f9c4b695283f8cef5458',
    '5gd084bb85e716ca' ],
  configurationHash: 'tExQ/a1n0/isuPxqeAT/nw==',
};

describe('elency-config - client', function () {

  let authorizationHeader = undefined;

  beforeEach(() => {
    authorizationHeader = undefined;
  });

  describe('object instantiation', function () {

    describe('throws an exception', function () {

      it('if configuration is not provided', function () {

        let fn = function () {
          elencyConfig();
        }

        expect(fn).to.throw('invalid configuration');
      });

      it('if uri is not provided', function () {

        let fn = function () {
          elencyConfig({});
        }
        expect(fn).to.throw('uri has not been defined');
      });

      it('if uri is empty', function () {

        let fn = function () {
          elencyConfig({uri: ''});
        }
        expect(fn).to.throw('uri has not been defined');
      });

      it('if appId is not provided', function () {

        let fn = function () {
          elencyConfig({
            uri: 'http://localhost:8080'
          });
        };

        expect(fn).to.throw('appId has not been defined');
      });

      it('if appId is empty', function () {

        let fn = function () {
          elencyConfig({
            uri: 'http://localhost:8080',
            appId: ''
          });
        };

        expect(fn).to.throw('appId has not been defined');
      });

      it('if environment is not provided', function () {

        let fn = function () {
          elencyConfig({
            uri: 'http://localhost:8080',
            appId: 'proj'
          });
        };

        expect(fn).to.throw('environment has not been defined');
      });

      it('if environment is empty', function () {

        let fn = function () {
          elencyConfig({
            uri: 'http://localhost:8080',
            appId: 'proj',
            environment: ''
          });
        };

        expect(fn).to.throw('environment has not been defined');
      });

      it('if appVersion does not exist', function () {

        let fn = function () {
          elencyConfig({
            uri: 'http://localhost:8080',
            appId: 'proj',
            environment: 'prod',
            refreshInterval: '1000',
            HMACAuthorizationKey: HMACAuthorizationKey,
            configEncryptionKey: encryptionKey
          });
        };

        expect(fn).to.throw(/valid app version has not been defined/);
      });

      it('if appVersion is not valid', function () {

        let fn = function () {
          elencyConfig({
            uri: 'http://localhost:8080',
            appId: 'proj',
            environment: 'prod',
            refreshInterval: '1000',
            HMACAuthorizationKey: HMACAuthorizationKey,
            configEncryptionKey: encryptionKey,
            appVersion: '1'
          });
        };

        expect(fn).to.throw(/valid app version has not been defined/);
      });

      it('if appVersion is a 1 part version number', function () {

        let fn = function () {
          elencyConfig({
            uri: 'http://localhost:8080',
            appId: 'proj',
            environment: 'prod',
            refreshInterval: '1000',
            HMACAuthorizationKey: HMACAuthorizationKey,
            configEncryptionKey: encryptionKey,
            appVersion: '1'
          });
        };

        expect(fn).to.throw(/valid app version has not been defined/);
      });

      it('if appVersion is a 2 part version number', function () {

        let fn = function () {
          elencyConfig({
            uri: 'http://localhost:8080',
            appId: 'proj',
            environment: 'prod',
            refreshInterval: '1000',
            HMACAuthorizationKey: HMACAuthorizationKey,
            configEncryptionKey: encryptionKey,
            appVersion: '1.1'
          });
        };

        expect(fn).to.throw(/valid app version has not been defined/);
      });

      it('if appVersion is a 4 part version number', function () {

        let fn = function() {
          elencyConfig({
            uri: 'http://localhost:8080',
            appId: 'proj',
            environment: 'prod',
            refreshInterval: '1000',
            HMACAuthorizationKey: HMACAuthorizationKey,
            configEncryptionKey: encryptionKey,
            appVersion: '1.1.1.1'
          });
        };

        expect(fn).to.throw(/valid app version has not been defined/);

      });

      it('if appVersion is a 5 part version number', function () {

        let fn = function () {
          elencyConfig({
            uri: 'http://localhost:8080',
            appId: 'proj',
            environment: 'prod',
            refreshInterval: '1000',
            HMACAuthorizationKey: HMACAuthorizationKey,
            configEncryptionKey: encryptionKey,
            appVersion: '1.1.1.1.1'
          });
        };

        expect(fn).to.throw(/valid app version has not been defined/);
      });

      it('if HMACAuthorizationKey is not provided', function () {

        let fn = function () {
          elencyConfig({
            uri: 'http://localhost:8080',
            appId: 'proj',
            appVersion: '1.1.1',
            environment: 'prod',
            configEncryptionKey: encryptionKey
          });
        };

        expect(fn).to.throw('HMACAuthorizationKey has not been defined');
      });

      it('if HMACAuthorizationKey is empty', function () {

        let fn = function () {
          elencyConfig({
            uri: 'http://localhost:8080',
            appId: 'proj',
            appVersion: '1.1.1',
            environment: 'prod',
            HMACAuthorizationKey: '',
            configEncryptionKey: encryptionKey
          });
        };

        expect(fn).to.throw('HMACAuthorizationKey has not been defined');
      });

      it('if HMACAuthorizationKey is not 32 characters', function () {

          let fn = function () {
              elencyConfig({
                  uri: 'http://localhost:8080',
                  appId: 'proj',
                  appVersion: '1.1.1',
                  environment: 'prod',
                  HMACAuthorizationKey: 'a',
                  configEncryptionKey: encryptionKey
              });
          };

          expect(fn).to.throw('HMACAuthorizationKey length should be 32');
      });

      it('if configEncryptionKey is not provided', function () {

        let fn = function () {
          elencyConfig({
            uri: 'http://localhost:8080',
            appId: 'proj',
            appVersion: '1.1.1',
            environment: 'prod',
            HMACAuthorizationKey: HMACAuthorizationKey,
          });
        };

        expect(fn).to.throw('configEncryptionKey has not been defined');
      });

      it('if configEncryptionKey is empty', function () {

        let fn = function () {
          elencyConfig({
            uri: 'http://localhost:8080',
            appId: 'proj',
            appVersion: '1.1.1',
            environment: 'prod',
            HMACAuthorizationKey: HMACAuthorizationKey,
            configEncryptionKey: ''
          });
        };

        expect(fn).to.throw('configEncryptionKey has not been defined');
      });

      it('if configEncryptionKey is not 32 characters', function () {

          let fn = function () {
              elencyConfig({
                  uri: 'http://localhost:8080',
                  appId: 'proj',
                  appVersion: '1.1.1',
                  environment: 'prod',
                  HMACAuthorizationKey: HMACAuthorizationKey,
                  configEncryptionKey: 'a'
              });
          };

          expect(fn).to.throw('configEncryptionKey length should be 32');
      });

      it('refreshInterval is defined and is empty', function () {

        let fn = function () {
          elencyConfig({
            uri: 'http://localhost:8080',
            appId: 'proj',
            appVersion: '1.1.1',
            environment: 'prod',
            HMACAuthorizationKey: HMACAuthorizationKey,
            configEncryptionKey: encryptionKey,
            refreshInterval: ''
          });
        };

        expect(fn).to.throw('refreshInterval is invalid');
      });

      it('refreshInterval is defined and is not an integer', function () {

        let fn = function () {
          elencyConfig({
            uri: 'http://localhost:8080',
            appId: 'proj',
            appVersion: '1.1.1',
            environment: 'prod',
            HMACAuthorizationKey: HMACAuthorizationKey,
            configEncryptionKey: encryptionKey,
            refreshInterval: 'asdf'
          });
        };

        expect(fn).to.throw('refreshInterval is invalid');
      });

      it('retrieved is not a function', function () {

        let fn = function () {
          elencyConfig({
            uri: 'http://localhost:8080',
            appId: 'proj',
            appVersion: '1.1.1',
            environment: 'prod',
            refreshInterval: '1000',
            HMACAuthorizationKey: HMACAuthorizationKey,
            configEncryptionKey: encryptionKey,
            retrieved: 'test'
          });
        };

        expect(fn).to.throw('retrieved must be a callback function');
      });

      it('refreshFailure is not a function', function () {

        let fn = function () {
          elencyConfig({
            uri: 'http://localhost:8080',
            appId: 'proj',
            appVersion: '1.1.1',
            environment: 'prod',
            refreshInterval: '1000',
            HMACAuthorizationKey: HMACAuthorizationKey,
            configEncryptionKey: encryptionKey,
            refreshFailure: 'test'
          });
        };

        expect(fn).to.throw('refreshFailure must be a callback function');
      });

    });

    describe('is successful', function () {

      it('when valid data is provided', function () {

        elencyConfig({
          uri: 'http://localhost:8080',
          appId: 'proj',
          appVersion: '1.1.1',
          environment: 'prod',
          refreshInterval: '1000',
          HMACAuthorizationKey: HMACAuthorizationKey,
          configEncryptionKey: encryptionKey,
          retrieved: () => {},
          retrievalFailure: () => {}
        });

      });

      it('when valid data is provided with a 3 part version number', function () {

        elencyConfig({
          uri: 'http://localhost:8080',
          appId: 'proj',
          environment: 'prod',
          refreshInterval: '1000',
          HMACAuthorizationKey: HMACAuthorizationKey,
          configEncryptionKey: encryptionKey,
          appVersion: '1.1.1'
        });

      });

      it('when valid data is provided and using localConfiguration', function () {

        elencyConfig({
          uri: 'http://localhost:8080',
          appId: 'proj',
          appVersion: '1.1.1',
          environment: 'prod',
          refreshInterval: '1000',
          HMACAuthorizationKey: HMACAuthorizationKey,
          configEncryptionKey: encryptionKey,
          retrieved: () => {},
          retrievalFailure: () => {},
          localConfiguration: {
            appVersion: "1.1.1",
            environment: "Test",
            configurationId: "1234",
            configurationData: {}
          }
        });

      });

    });

  });

  describe('init', function () {

    describe('calls the success callback', function () {

      it('when configuration data is returned from elency-config - 200 status code', async function () {

        var requestNockOne = nock('http://localhost:8080')
          .matchHeader('authorization', matchAuthorizationHeader('/config', 'head', true))
          .head('/config')
          .reply(200, '', { 'x-access-token': '8363999c-bdc2-45a7-afe6-b0af9ad44aca' });

        var requestNockTwo = nock('http://localhost:8080')
          .matchHeader('authorization', matchAuthorizationHeader('/config/proj/prod/1.1.1', 'get'))
          .matchHeader('x-access-token', matchAccessToken('8363999c-bdc2-45a7-afe6-b0af9ad44aca'))
          .get('/config/proj/prod/1.1.1')
          .reply(200, validConfigurationBody);

        var config = elencyConfig({
          uri: 'http://localhost:8080',
          appId: 'proj',
          appVersion: '1.1.1',
          environment: 'prod',
          refreshInterval: '1000',
          HMACAuthorizationKey: HMACAuthorizationKey,
          configEncryptionKey: encryptionKey
        });

        try {
          await config.init();
          expect(requestNockOne.isDone()).to.eql(true);
          expect(requestNockTwo.isDone()).to.eql(true);
          expect(config.getAllKeys().length).to.eql(2);
          expect(config.get('KeyOne')).to.eql('KeyOneValue');
          expect(config.get('KeyTwo')).to.eql('KeyTwoValue');
          expect(config.appVersion()).to.eql('1.1.1');
          expect(config.environment()).to.eql('prod');
          expect(config.configurationId()).to.eql('9b386d19-fa7a-40ba-b794-f961e56ffe07');
        }
        catch(err) {
          console.log(err);
          throw new Error('an error was defined');
        }
      });

      it('when localConfiguration is defined', async function () {

        let config = elencyConfig({
          uri: 'http://localhost:8080',
          appId: 'proj',
          appVersion: '1.1.1',
          environment: 'prod',
          refreshInterval: '1000',
          HMACAuthorizationKey: HMACAuthorizationKey,
          configEncryptionKey: encryptionKey,
          retrieved: () => {},
          retrievalFailure: () => {},
          localConfiguration: {
            appVersion: "1.1.2",
            environment: "production",
            configurationId: '9b386d19-fa7a-40ba-b794-f961e56ffe08',
            configurationData: {
              KeyOne: 'KeyOneValue2',
              KeyTwo: 'KeyTwoValue3'
            }
          }
        });

        try {
          await config.init();
          expect(config.getAllKeys().length).to.eql(2);
          expect(config.get('KeyOne')).to.eql('KeyOneValue2');
          expect(config.get('KeyTwo')).to.eql('KeyTwoValue3');
          expect(config.appVersion()).to.eql('1.1.2');
          expect(config.environment()).to.eql('production');
          expect(config.configurationId()).to.eql('9b386d19-fa7a-40ba-b794-f961e56ffe08');
        }
        catch(err) {
          console.log(err);
          throw new Error('an error was defined');
        }
      });

    });

    describe('calls the error callback', function () {

      it('when client cannot connect to elency-config', async function () {

        var config = elencyConfig({
          uri: 'http://localhost:8080',
          appId: 'proj',
          appVersion: '1.1.1',
          environment: 'prod',
          refreshInterval: '1000',
          HMACAuthorizationKey: HMACAuthorizationKey,
          configEncryptionKey: encryptionKey
        });

        try {
          await config.init();
          throw new Error('an error was not defined');
        }
        catch(err) {
          expect(err.toString()).to.eql('Error: An error occurred while trying to retrieve an x-access-token');
        }

      });

      it('when non 200 status code is returned from elency-config', async function () {

        var requestNockOne = nock('http://localhost:8080')
          .matchHeader('authorization', matchAuthorizationHeader('/config', 'head', true))
          .head('/config')
          .reply(200, '', { 'x-access-token': '8363999c-bdc2-45a7-afe6-b0af9ad44aca' });

        var requestNockTwo = nock('http://localhost:8080')
          .matchHeader('x-access-token', matchAccessToken('8363999c-bdc2-45a7-afe6-b0af9ad44aca'))
          .get('/config/proj/prod/1.1.1')
          .reply(401);

        var config = elencyConfig({
          uri: 'http://localhost:8080',
          appId: 'proj',
          appVersion: '1.1.1',
          environment: 'prod',
          refreshInterval: '1000',
          HMACAuthorizationKey: HMACAuthorizationKey,
          configEncryptionKey: encryptionKey
        });

        try {
          await config.init();
          throw new Error('an error was not defined');
        }
        catch(err) {
          expect(requestNockOne.isDone()).to.eql(true);
          expect(requestNockTwo.isDone()).to.eql(true);
          expect(err.toString()).to.eql('Error: An error occurred while trying to retrieve the configuration');
        }

      });

    });

  });

  describe('get', function () {

    it('throws an error if not initialized', function() {

      let fn = function () {
        var config = elencyConfig({
          uri: 'http://localhost:8080',
          appId: 'proj',
          appVersion: '1.1.1',
          environment: 'prod',
          refreshInterval: '1000',
          HMACAuthorizationKey: HMACAuthorizationKey,
          configEncryptionKey: encryptionKey
        });

        config.get('cheese');
      };

      expect(fn).to.throw('The client has not been successfully initialized');

    });

    it('correctly returns configuration key values', async function() {

      var requestNockOne = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config', 'head', true))
        .head('/config')
        .reply(200, '', { 'x-access-token': '8363999c-bdc2-45a7-afe6-b0af9ad44aca' });

      var requestNockTwo = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config/proj/prod/1.1.1', 'get'))
        .matchHeader('x-access-token', matchAccessToken('8363999c-bdc2-45a7-afe6-b0af9ad44aca'))
        .get('/config/proj/prod/1.1.1')
        .reply(200, validConfigurationBody);

      var config = elencyConfig({
        uri: 'http://localhost:8080',
        appId: 'proj',
        appVersion: '1.1.1',
        environment: 'prod',
        refreshInterval: '1000',
        HMACAuthorizationKey: HMACAuthorizationKey,
        configEncryptionKey: encryptionKey
      });

      try {
        await config.init();
        expect(requestNockOne.isDone()).to.eql(true);
        expect(requestNockTwo.isDone()).to.eql(true);
        expect(config.get('KeyOne')).to.eql('KeyOneValue');
        expect(config.get('KeyTwo')).to.eql('KeyTwoValue');
      }
      catch(err) {
        console.log(err);
        throw new Error('an error was defined');
      }
    });

    it('returns undefined if key does not exist', async function() {

      var requestNockOne = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config', 'head', true))
        .head('/config')
        .reply(200, '', { 'x-access-token': '8363999c-bdc2-45a7-afe6-b0af9ad44aca' });

      var requestNockTwo = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config/proj/prod/1.1.1', 'get'))
        .matchHeader('x-access-token', matchAccessToken('8363999c-bdc2-45a7-afe6-b0af9ad44aca'))
        .get('/config/proj/prod/1.1.1')
        .reply(200, validConfigurationBody);

      var config = elencyConfig({
        uri: 'http://localhost:8080',
        appId: 'proj',
        appVersion: '1.1.1',
        environment: 'prod',
        refreshInterval: '1000',
        HMACAuthorizationKey: HMACAuthorizationKey,
        configEncryptionKey: encryptionKey
      });

      try {
        await config.init();
        expect(requestNockOne.isDone()).to.eql(true);
        expect(requestNockTwo.isDone()).to.eql(true);
        expect(config.get('key3')).to.eql(undefined);
      }
      catch(err) {
        throw new Error('an error was defined');
      }
    });

  });

  describe('getAllKeys', function () {

    it('throws an error if not initialized', function() {

      var config = elencyConfig({
        uri: 'http://localhost:8080',
        appId: 'proj',
        appVersion: '1.1.1',
        environment: 'prod',
        refreshInterval: '1000',
        HMACAuthorizationKey: HMACAuthorizationKey,
        configEncryptionKey: encryptionKey
      });

      try {
        config.getAllKeys();
      }
      catch (err) {
        expect(err.toString()).to.eql('Error: The client has not been successfully initialized');
      }
    });

    it('correctly returns all configuration keys', async function() {

      var requestNockOne = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config', 'head', true))
        .head('/config')
        .reply(200, '', { 'x-access-token': '8363999c-bdc2-45a7-afe6-b0af9ad44aca' });

      var requestNockTwo = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config/proj/prod/1.1.1', 'get'))
        .matchHeader('x-access-token', matchAccessToken('8363999c-bdc2-45a7-afe6-b0af9ad44aca'))
        .get('/config/proj/prod/1.1.1')
        .reply(200, validConfigurationBody);

      var config = elencyConfig({
        uri: 'http://localhost:8080',
        appId: 'proj',
        appVersion: '1.1.1',
        environment: 'prod',
        refreshInterval: '1000',
        HMACAuthorizationKey: HMACAuthorizationKey,
        configEncryptionKey: encryptionKey
      });

      try {
        await config.init();
        expect(requestNockOne.isDone()).to.eql(true);
        expect(requestNockTwo.isDone()).to.eql(true);
        var keys = config.getAllKeys();

        expect(keys.length).to.eql(2);
        expect(keys[0]).to.eql('KeyOne');
        expect(keys[1]).to.eql('KeyTwo');
      }
      catch(err) {
        console.log(err);
        throw new Error('an error was defined');
      }
    });

  });

  describe('refresh', function() {

    it('throws an error if not initialized', async function() {

      var config = elencyConfig({
        uri: 'http://localhost:8080',
        appId: 'proj',
        appVersion: '1.1.1',
        environment: 'prod',
        refreshInterval: '1000',
        HMACAuthorizationKey: HMACAuthorizationKey,
        configEncryptionKey: encryptionKey
      });

      try {
        await config.refresh();
        throw new Error('an error was not defined');
      }
      catch (err) {
        expect(err.toString()).to.eql('Error: The client has not been successfully initialized');
      }

    });

    it('correctly updates the configuration', async function() {

      var requestNockOne = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config', 'head', true))
        .head('/config')
        .reply(200, '', { 'x-access-token': '8363999c-bdc2-45a7-afe6-b0af9ad44aca' });

      var requestNockTwo = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config/proj/prod/1.1.1', 'get'))
        .matchHeader('x-access-token', matchAccessToken('8363999c-bdc2-45a7-afe6-b0af9ad44aca'))
        .get('/config/proj/prod/1.1.1')
        .reply(200, validConfigurationBody);

      var requestNockThree = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config/proj/prod/1.1.1', 'head'))
        .matchHeader('x_version_hash', function (val) {
          return val === validConfigurationBody.configurationHash;
        })
        .head('/config/proj/prod/1.1.1')
        .reply(200);

      var requestNockFour = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config', 'head', true))
        .head('/config')
        .reply(200, '', { 'x-access-token': '7363999c-bdc2-45a7-afe6-b0af9ad44acb' });

      var requestNockFive = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config/proj/prod/1.1.1', 'get'))
        .matchHeader('x-access-token', matchAccessToken('7363999c-bdc2-45a7-afe6-b0af9ad44acb'))
        .get('/config/proj/prod/1.1.1')
        .reply(200, validConfigurationBody2);

      var config = elencyConfig({
        uri: 'http://localhost:8080',
        appId: 'proj',
        appVersion: '1.1.1',
        environment: 'prod',
        HMACAuthorizationKey: HMACAuthorizationKey,
        configEncryptionKey: encryptionKey
      });

      try {
        await config.init();
        expect(requestNockOne.isDone()).to.eql(true);
        expect(requestNockTwo.isDone()).to.eql(true);
        expect(config.getAllKeys().length).to.eql(2);
        expect(config.get('KeyOne')).to.eql('KeyOneValue');
        expect(config.get('KeyTwo')).to.eql('KeyTwoValue');

        try {
          await config.refresh();

          expect(requestNockThree.isDone()).to.eql(true);
          expect(requestNockFour.isDone()).to.eql(true);
          expect(requestNockFive.isDone()).to.eql(true);
          expect(config.getAllKeys().length).to.eql(3);
          expect(config.get('KeyOne')).to.eql('KeyOneValue');
          expect(config.get('KeyTwo')).to.eql('KeyTwoValueUpdated');
          expect(config.get('KeyThree')).to.eql('KeyThreeValue');
        }
        catch (err) {
          throw new Error('Should not have got here');
        }
      }
      catch (err) {
        throw new Error('Should not have got here');
      }
    });

    it('does not update the configuration if hash has not changed', async function() {

      var requestNockOne = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config', 'head', true))
        .head('/config')
        .reply(200, '', { 'x-access-token': '8363999c-bdc2-45a7-afe6-b0af9ad44aca' });

      var requestNockTwo = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config/proj/prod/1.1.1', 'get'))
        .matchHeader('x-access-token', matchAccessToken('8363999c-bdc2-45a7-afe6-b0af9ad44aca'))
        .get('/config/proj/prod/1.1.1')
        .reply(200, validConfigurationBody);

      var requestNockThree = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config/proj/prod/1.1.1', 'head'))
        .matchHeader('x_version_hash', function (val) {
          return val === validConfigurationBody.configurationHash;
        })
        .head('/config/proj/prod/1.1.1')
        .reply(204);

      var requestNockFour = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config', 'head', true))
        .head('/config')
        .reply(200, '', { 'x-access-token': '7363999c-bdc2-45a7-afe6-b0af9ad44acb' });

      var requestNockFive = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config/proj/prod/1.1.1', 'get'))
        .matchHeader('x-access-token', '7363999c-bdc2-45a7-afe6-b0af9ad44acb')
        .get('/config/proj/prod/1.1.1')
        .reply(200, validConfigurationBody);

      var config = elencyConfig({
        uri: 'http://localhost:8080',
        appId: 'proj',
        appVersion: '1.1.1',
        environment: 'prod',
        HMACAuthorizationKey: HMACAuthorizationKey,
        configEncryptionKey: encryptionKey
      });

      try {
        await config.init();

        expect(requestNockOne.isDone()).to.eql(true);
        expect(requestNockTwo.isDone()).to.eql(true);
        expect(config.get('KeyOne')).to.eql('KeyOneValue');

        try {
          await config.refresh();
          expect(requestNockThree.isDone()).to.eql(true);
          expect(requestNockFour.isDone()).to.eql(false);
          expect(requestNockFive.isDone()).to.eql(false);
          expect(config.get('KeyOne')).to.eql('KeyOneValue');
        }
        catch (err) {
          throw 'should not have got here';
        }
      }
      catch (err) {
        throw 'should not have got here';
      }
    });

  });

  describe('refreshInterval', function() {

    it('timered refresh correctly updates configuration', async function() {

      function assertion(requestNockThree, requestNockFour, requestNockFive, config) {

        return new Promise((resolve, reject) => {

          let start = new Date();
          let interval = setInterval(() => {
            let now = new Date();

            if (now - start > 2000) {
              clearInterval(interval);
              return reject('Waited too long for assertion');
            }

            try {
              expect(requestNockThree.isDone()).to.eql(true);
              expect(requestNockFour.isDone()).to.eql(true);
              expect(requestNockFive.isDone()).to.eql(true);
              expect(config.getAllKeys().length).to.eql(3);
              expect(config.get('KeyOne')).to.eql('KeyOneValue');
              expect(config.get('KeyTwo')).to.eql('KeyTwoValueUpdated');
              expect(config.get('KeyThree')).to.eql('KeyThreeValue');
              clearInterval(interval);
              return resolve();
            }
            catch (err) {
            }
          }, 10);

        });
      }

      var requestNockOne = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config', 'head', true))
        .head('/config')
        .reply(200, '', { 'x-access-token': '8363999c-bdc2-45a7-afe6-b0af9ad44aca' });

      var requestNockTwo = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config/proj/prod/1.1.1', 'get'))
        .matchHeader('x-access-token', matchAccessToken('8363999c-bdc2-45a7-afe6-b0af9ad44aca'))
        .get('/config/proj/prod/1.1.1')
        .reply(200, validConfigurationBody);

      var requestNockThree = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config/proj/prod/1.1.1', 'head'))
        .matchHeader('x_version_hash', function (val) {
          return val === validConfigurationBody.configurationHash;
        })
        .head('/config/proj/prod/1.1.1')
        .reply(200);

      var requestNockFour = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config', 'head', true))
        .head('/config')
        .reply(200, '', { 'x-access-token': '7363999c-bdc2-45a7-afe6-b0af9ad44acb' });

      var requestNockFive = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config/proj/prod/1.1.1', 'get'))
        .matchHeader('x-access-token', matchAccessToken('7363999c-bdc2-45a7-afe6-b0af9ad44acb'))
        .get('/config/proj/prod/1.1.1')
        .reply(200, validConfigurationBody2);

      var config = elencyConfig({
        uri: 'http://localhost:8080',
        appId: 'proj',
        appVersion: '1.1.1',
        environment: 'prod',
        refreshInterval: '100',
        HMACAuthorizationKey: HMACAuthorizationKey,
        configEncryptionKey: encryptionKey
      });

      try {
        await config.init();

        expect(requestNockOne.isDone()).to.eql(true);
        expect(requestNockTwo.isDone()).to.eql(true);

        expect(config.getAllKeys().length).to.eql(2);
        expect(config.get('KeyOne')).to.eql('KeyOneValue');
        expect(config.get('KeyTwo')).to.eql('KeyTwoValue');

        await assertion(requestNockThree, requestNockFour, requestNockFive, config);

      }
      catch (err) {
        console.log(err)
        throw 'should not have got here';
      }

    });

    it('timered refresh does not update configuration if hash has not changed', async function() {

      function assertion(requestNockThree, requestNockFour, requestNockFive, config) {

        return new Promise((resolve, reject) => {

          let start = new Date();
          let interval = setInterval(() => {
            let now = new Date();

            if (now - start > 2000) {
              clearInterval(interval);
              return reject('Waited too long for assertion');
            }

            try {
              expect(requestNockThree.isDone()).to.eql(true);
              expect(requestNockFour.isDone()).to.eql(false);
              expect(requestNockFive.isDone()).to.eql(false);
              expect(config.get('KeyOne')).to.eql('KeyOneValue');
              clearInterval(interval);
              return resolve();
            }
            catch (err) {
            }
          }, 10);

        });
      }

      var requestNockOne = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config', 'head', true))
        .head('/config')
        .reply(200, '', { 'x-access-token': '8363999c-bdc2-45a7-afe6-b0af9ad44aca' });

      var requestNockTwo = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config/proj/prod/1.1.1', 'get'))
        .matchHeader('x-access-token', matchAccessToken('8363999c-bdc2-45a7-afe6-b0af9ad44aca'))
        .get('/config/proj/prod/1.1.1')
        .reply(200, validConfigurationBody);

      var requestNockThree = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config/proj/prod/1.1.1', 'head'))
        .matchHeader('x_version_hash', function (val) {
          return val === validConfigurationBody.configurationHash;
        })
        .head('/config/proj/prod/1.1.1')
        .reply(204);

      var requestNockFour = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config', 'head', true))
        .head('/config')
        .reply(200, '', { 'x-access-token': '7363999c-bdc2-45a7-afe6-b0af9ad44acb' });

      var requestNockFive = nock('http://localhost:8080')
        .matchHeader('authorization', matchAuthorizationHeader('/config/proj/prod/1.1.1', 'get'))
        .matchHeader('x-access-token', matchAccessToken('7363999c-bdc2-45a7-afe6-b0af9ad44acb'))
        .get('/config/proj/prod/1.1.1')
        .reply(200, validConfigurationBody2);

      var config = elencyConfig({
        uri: 'http://localhost:8080',
        appId: 'proj',
        appVersion: '1.1.1',
        environment: 'prod',
        refreshInterval: '100',
        HMACAuthorizationKey: HMACAuthorizationKey,
        configEncryptionKey: encryptionKey
      });

      try {
        await config.init();

        expect(requestNockOne.isDone()).to.eql(true);
        expect(requestNockTwo.isDone()).to.eql(true);

        expect(config.get('KeyOne')).to.eql('KeyOneValue');

        await assertion(requestNockThree, requestNockFour, requestNockFive, config);
      }
      catch (err) {
        throw 'should not have got here';
      }
    });

  });

  function generateSignature(appId, path, method, nonce, timestamp, authorizationKey) {

    const value = `${appId}${path}${method}${nonce}${timestamp}`;
    const hash = hasher.hashSync(value, authorizationKey);
    return hash;
  }

  function matchAccessToken(accessToken) {
    return function(val) {
      return val === accessToken;
    }
  }
  function matchAuthorizationHeader(path, method, accessToken = false) {

    return function(val) {
      
      if (!val) {
        return false;
      }

      let parts = val.split(':');

      if (parts.length !== 4)
        return false;

      let appId = parts[0];
      let nonce = parts[2];
      let timestamp = parts[3];

      let authorizationKey = (accessToken === true ? HMACAuthorizationKey : encryptionKey);
      const signature = generateSignature(appId, path, method, nonce, timestamp, authorizationKey);

      return (parts[1] === signature);
    }
  }

});
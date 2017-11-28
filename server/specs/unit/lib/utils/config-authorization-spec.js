const uuid = require('uuid').v4;
const expect = require('chai').expect;
const hasher = require('../../../../lib/hashers/hmac-sha256');
const encryption = require('../../../../lib/utils/encryption')({});
const models = require('../../../../models');
const configAuthorization = require('../../../../lib/utils/config-authorization');
const Configuration = require('../../../../lib/configuration');

describe('config-authorization', () => {

  const HMACAuthorizationKey = 'th15154p455w0rd!th15154p455w0rd!';

  let configuration;
  let configAuthorizationInstance;

  beforeEach(async () => {
    var key = new models.key({
      keyName: 'akey',
      value: HMACAuthorizationKey
    });

    key = await encryption.encryptKey(key);

    configuration = new models.configuration({
      appVersion: '1.0.0',
      key
    });

    configAuthorizationInstance = configAuthorization(new Configuration({
      validateAuthorizationTokenWindow: true,
      authorizationTokenValidationWindowInSeconds: 60 * 5
    }), encryption);
  });
  
  describe('returns a 0 (success)', () => {
    
    it('if authorization token is valid', async () => {

      const method = 'get';
      const authorization = await generateAuthorizationHeader('appId', method);
      const req = createReq(authorization);

      const result = await configAuthorizationInstance.isAuthorized(configuration, req, method);
      expect(result).to.eql(0);
    });

    it('if authorization token is valid and timestamp is just inside window', async () => {

      const method = 'get';
      let timestamp = Date.now() - (288 * 1000);
      const authorization = await generateAuthorizationHeader('appId', method, timestamp);
      const req = createReq(authorization);
      const result = await configAuthorizationInstance.isAuthorized(configuration, req, method);
      expect(result).to.eql(0);
    });
  });


  describe('returns a 401', () => {
    it('if an authorization header is not supplied', async () => {
      const method = 'get';
      const authorization = undefined;

      const req = createReq(authorization);
      const result = await configAuthorizationInstance.isAuthorized(configuration, req, method);

      expect(result).to.eql(401);
    });

    it('if the authorization header is empty', async () => {
      const method = 'get';
      const authorization = '';

      const req = createReq(authorization);
      const result = await configAuthorizationInstance.isAuthorized(configuration, req, method);

      expect(result).to.eql(401);
    });
  });

  describe('returns a 403', () => {

    it('if the authorization header is in the wrong format', async () => {
      const method = 'get';
      const authorization = 'asdf:asdf:asdf';

      const req = createReq(authorization);
      const result = await configAuthorizationInstance.isAuthorized(configuration, req, method);

      expect(result).to.eql(403);
    });

    it('if the authorization header has an invalid signature', async () => {
      const method = 'get';
      const authorization = await generateAuthorizationHeader('appId', 'post');

      const req = createReq(authorization);
      const result = await configAuthorizationInstance.isAuthorized(configuration, req, method);

      expect(result).to.eql(403);
    });

    it('if the authorization header has an invalid date', async () => {
      const method = 'get';
      const authorization = await generateAuthorizationHeader('appId', method, ' a');

      const req = createReq(authorization);
      const result = await configAuthorizationInstance.isAuthorized(configuration, req, method);

      expect(result).to.eql(403);
    });

    it('if the authorization header timestamp is before window', async () => {
      const method = 'get';

      let timestamp = Date.now() - (301 * 1000);
      const authorization = await generateAuthorizationHeader('appId', method, timestamp);

      const req = createReq(authorization);
      const result = await configAuthorizationInstance.isAuthorized(configuration, req, method);

      expect(result).to.eql(403);
    });

    it('if the authorization header timestamp is after window', async () => {
      const method = 'get';

      let timestamp = Date.now() + (301 * 1000);
      const authorization = await generateAuthorizationHeader('appId', method, timestamp);

      const req = createReq(authorization);
      const result = await configAuthorizationInstance.isAuthorized(configuration, req, method);

      expect(result).to.eql(403);
    });
    
  });

  async function generateAuthorizationHeader(appId, method, overiddenTimestamp) {
    const headerData = getHeaderData(appId, '/config/appid/prod/1.2.3', method, overiddenTimestamp);
    const signature = await hasher.hash(headerData.value, HMACAuthorizationKey);
    return `${appId}:${signature}:${headerData.nonce}:${headerData.timestamp}`;
  }

  function getHeaderData(appId, path, method, overiddenTimestamp) {
    const nonce = uuid();

    let timestamp = Date.now();

    if (overiddenTimestamp !== undefined) {
      timestamp = overiddenTimestamp;
    }

    const value = `${appId}${path.toLowerCase()}${method.toLowerCase()}${nonce}${timestamp}`;

    return {
      nonce,
      timestamp,
      value
    };
  }

  function createReq(authorization) {
    return {
      baseUrl: "/config",
      route: {
        path: '/appid/prod/1.2.3'
      },
      headers: {
        authorization
      }
    };
  }

});
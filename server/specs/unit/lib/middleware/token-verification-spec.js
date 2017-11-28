const uuid = require('uuid');

const models = require('../../../../models');
const repositories = require('../../../../lib/repositories');
const middleware = require('../../../../lib/middleware/token-verification');

describe('token-verification middleware', () => {

  let instance;
  let tokensRepo;

  before(async () => {
    let elencyConfig = {
      mongoUrl: 'mongodb://localhost:27017/elency-config'
    };

    let allRepositories = await repositories(elencyConfig);
    instance = await middleware(allRepositories);
    tokensRepo = allRepositories.token;
  });

  let sentStatusCode = -1;

  const res = {
    sendStatus: (statusCode) => {
      sentStatusCode = statusCode;
    }
  };

  function next(done) {
    return function() {
      done();
    }
  }

  beforeEach(() => {
    sentStatusCode = -1;
  });

  describe('calls next callback', () => {

    const accessToken = uuid.v4();

    before(async () => {
      await tokensRepo.add(new models.token({ accessToken }));
    });

    it('if access token is valid', (done) => {
      instance(createReq({ 'x-access-token': accessToken }), res, next(done));
    });
  });

  function await(expectedStatusCode, done) {
    let interval = setInterval(() => {
      if (sentStatusCode === expectedStatusCode) {
        clearInterval(interval);
        done();
      }
    }, 10);
  }

  describe('returns a 401', () => {

    it('if the request has no body', (done) => {

      instance(createReq(undefined), res, next(() => { }));
      await(401, done);
    });

    it('if the request body has no x-access-token', (done) => {

      instance(createReq({}), res, next(() => { }));
      await(401, done);
    });

    it('if the request body x-access-token is not a string', (done) => {

      instance(createReq({ 'x-access-token': 1 }), res, next(() => { }));
      await(401, done);
    });

    it('if the request body x-access-token is empty', (done) => {

      instance(createReq({ 'x-access-token': "" }), res, next(() => { }));
      await(401, done);
    });

  });

  describe('returns a 403', () => {

    describe('if access token has expired', () => {

      const accessToken = uuid.v4();

      before(async () => {
        const expires = new Date();
        expires.setSeconds(expires.getSeconds() - 10);
        await tokensRepo.add({ accessToken, expires });
      });

      it('', (done) => {
        instance(createReq({ 'x-access-token': accessToken }), res, next(() => { }));
        await(403, done);
      });

    });

    it('if access token does not exist', (done) => {
      const accessToken = uuid.v4();
      instance(createReq({ 'x-access-token': accessToken }), res, next(() => { }));
      await(403, done);
    });

  });

  function createReq(headers) {
    return {
      path: 'appid/prod/1.2.3',
      headers
    };
  }

});
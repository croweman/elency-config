const uuid = require('uuid');

const models = require('../../../../models');
const repositories = require('../../../../lib/repositories');
const middleware = require('../../../../lib/middleware/ensure-authenticated');
const constants = require('../../../../lib/constants');

describe('ensure-authenticated middleware', () => {

  let instance;
  let userRepo;
  let enabledUser;
  let disabledUser;
  let adminUser;

  beforeEach(async () => {
    let elencyConfig = {
      mongoUrl: 'mongodb://localhost:27017/elency-config'
    };

    let allRepositories = await repositories(elencyConfig);
    instance = await middleware(allRepositories);
    userRepo = allRepositories.user;

    let userId = uuid.v4();
    enabledUser = new models.user({
      userId: userId,
      userName: userId + 'enabled',
      enabled: true
    });

    userId = uuid.v4();
    disabledUser = new models.user({
      userId: userId,
      userName: userId + 'disabled',
      enabled: false
    });

    adminUser = new models.user({
      userId: constants.adminUserId,
      userName: 'admin',
      enabled: true
    });

    await userRepo.remove(adminUser);
    await userRepo.add(adminUser);
  });

  function next(done, req, userId) {
    return function() {
      if (req && userId) {

        if (req.user.userId === userId) {
          done();
        }
        else {
          done('valid req.user not defined');
        }
      }
      else {
        done();
      }

    }
  }

  describe('redirects to /createAdminUser', () => {

    it('when the user is not authenticated and there is no admin user', (done) => {

      userRepo
        .remove(adminUser)
        .then(() => {
          instance(createReq('http://server/ui/do-something', false), createRes(done, '/createAdminUser'), undefined);
        });
    });

  });

  describe('calls next callback', () => {

    [
      'http://server/login',
      '/login',
      '/login/',
      '/login/?a=b',
      'https://server/logout',
      '/logout',
      '/logout/',
      '/logout/?a=b'
    ].forEach((url) => {

      it(`when accessing an endpoint that does not require authentication: ${url}`, (done) => {
        instance(createReq(url, false), undefined, next(done));
      });
    });

    it('when accessing an endpoint that requires authentication and a enabled user is logged in', (done) => {
      const req = createReq('http://server/ui/do-something', true, enabledUser.userId);

      instance(req, undefined, next(done, req, enabledUser.userId));
    });

  });

  describe('redirects to /login', () => {

    it('when the user is not authenticated', (done) => {
      instance(createReq('http://server/ui/do-something', false), createRes(done, '/login'), undefined);
    });

    it('when the user is authenticated but is no longer enabled', (done) => {
      instance(createReq('http://server/ui/do-something', true, disabledUser.userId, true), createRes(done, '/login'), undefined);
    });

  });

  function createReq(url, isAuthenticated, userId, disabled) {
    const req = {
      originalUrl: url,
      isAuthenticated: () => {
        return isAuthenticated;
      }
    };

    if (isAuthenticated === true) {
      req.user = new models.user({
        userId,
        userName: 'testuser',
        enabled: disabled !== undefined ? !disabled : true
      });
    }

    return req;
  }

  function createRes(done, expectedUrl) {
    return {
      redirect: (url) => {
        if (url === expectedUrl) {
          done();
        }
        else {
          done(`redirected to ${url}, but expected ${expectedUrl}`);
        }
      }
    }
  }

});
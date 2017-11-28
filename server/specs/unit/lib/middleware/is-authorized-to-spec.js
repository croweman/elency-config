const isAuthorizedTo = require('../../../../lib/middleware/is-authorized-to');

describe('is-authorized-to middleware', () => {

  let sentStatusCode = -1;
  let functionCalled = '';
  let result = undefined;

  const res = {
    status: (statusCode) => {
      sentStatusCode = statusCode;

      return {
        render: (viewPath) => {

          view = viewPath;

          return {
            end: () => {}
          }
        }
      }
    },
    renderUnauthorized: () => {
      functionCalled = 'renderUnauthorized';
    },
    renderError: () => {
      functionCalled = 'renderError';
    }
  };

  function next(done) {
    return function() {
      done();
    }
  }

  beforeEach(() => {
    sentStatusCode = -1;
    functionCalled = '';
    result = undefined;
  });

  let canPerformAction = (user, params) => {
    return new Promise((resolve, reject) => {
      if (result === undefined) {
        return reject('oops!');
      }

      return resolve(result);
    });
  };

  describe('calls the next callback', () => {

    it('when authorization succeeds', (done) => {

      result = true;

      const req = {
        user: {
          isNull: () => {
            return false;
          },
          enabled: true
        }
      };

      let instance = isAuthorizedTo(canPerformAction);

      instance(req, res, next(done));
    });

  });

  describe('returns a 401 and renders the unauthorized view', () => {

    it('when user does not exist', (done) => {
      result = true;

      const req = {};

      let instance = isAuthorizedTo(canPerformAction);

      instance(req, res, next(() => {}));

      await('renderUnauthorized', done);
    });

    it('when user exists but authorization fails', (done) => {
      result = false;

      const req = {
        user: {
          userName: 'lee',
          isNull: () => {
            return false;
          },
          hasRole: () => {
            return false;
          }
        },
        params: {}
      };

      let instance = isAuthorizedTo(canPerformAction);

      instance(req, res, next(() => {}));

      await('renderUnauthorized', done);
    });
  });

  describe('returns a 500 and renders the error view', () => {

    it('when an error occurs authorizing', (done) => {

      const req = {
        user: {
          userName: 'lee',
          isNull: () => {
            return false;
          },
          hasRole: () => {
            return false;
          },
          enabled: true
        },
        params: {}
      };

      let instance = isAuthorizedTo(canPerformAction);

      instance(req, res, next(() => {}));

      await('renderError', done);
    });

  });

  function await(expectedFunctionCalled, done) {
    let interval = setInterval(() => {
      if (functionCalled === expectedFunctionCalled) {
        clearInterval(interval);
        done();
      }
    }, 10);
  }
  
});
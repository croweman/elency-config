const nock = require('nock');

beforeEach(() => {
  nock.cleanAll();
});

// afterEach((done) => {
//   setTimeout(() => { done(); }, 1000);
// });
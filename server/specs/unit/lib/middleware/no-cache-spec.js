
const expect = require('chai').expect;
const middleware = require('../../../../lib/middleware/no-cache');

describe('no-cache middleware', () => {

  it('it sets cache-control header', async () => {

    let headerName = undefined;
    let headerValue = undefined;
    let nextCalled = false;

    const res = {
      set: (header, value) => {
        headerName = header;
        headerValue = value;
      }
    };

    function next() {
      nextCalled = true;
    }

    middleware({}, res, next);

    expect(headerName).to.eql('Cache-Control');
    expect(headerValue).to.eql('no-cache, no-store, must-revalidate');
    expect(nextCalled).to.eql(true);
  });

});
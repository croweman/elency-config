const expect = require('chai').expect,
  hasher = require('../../../../lib/hashers/hmac-md5');

describe('md5 lib', function() {

  describe('hash', () => {
    it('correctly hashes a string', async () => {
      const hash = await hasher.hash('TheValueToEncrypt', { password: 'aGVsbG93b3JsZA==' });
      expect(hash).to.eql('+2xzY7qJT7mQdgdgjn27TA==');
    });
  });

  describe('hashSync', () => {
    it('correctly hashes a string', () => {
      const hash = hasher.hashSync('TheValueToEncrypt', { password: 'aGVsbG93b3JsZA==' });
      expect(hash).to.eql('+2xzY7qJT7mQdgdgjn27TA==');
    });
  });
})
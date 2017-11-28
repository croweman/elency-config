const expect = require('chai').expect,
  encryptor = require('../../../../lib/encryptors/aes-256-ctr');

describe('aes-256-ctr lib', function() {

    const password = 'th15154p455w0rd!';

    it('correctly encrypts a string', async () => {
        const val = await encryptor.encrypt('TheValueToEncrypt', password);
        expect(val.length > 0).to.eql(true);
    });

    it('correctly decrypts a string', async () => {
        let val = await encryptor.encrypt('TheValueToEncrypt', password);
        expect(val.length > 0).to.eql(true);
        val = await encryptor.decrypt(val, password);
        expect(val).to.be.eql('TheValueToEncrypt');
    });
})
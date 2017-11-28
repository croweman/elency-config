const crypto = require('crypto'),
  expect = require('chai').expect,
  encryptor = require('../../../../lib/encryptors/aes-256-cbc');

describe('aes-256-cbc lib', function() {

    const password = 'th15154p455w0rd!th15154p455w0rd!';
    //const iv = crypto.randomBytes(16).toString('hex').slice(0, 16);
    const iv = '42d1e9706b63140c';

    it('correctly encrypts a string', async () => {
        let val = await encryptor.encrypt('TheValueToEncrypt', password, iv);
        expect(val.length).to.eql(2);
        expect(val[0]).to.eql('5cc4051bc64227f25ca14836005156fc8afa0b3be93115fe2fb6cb3a3a3dd217');
        expect(val[1]).to.eql('42d1e9706b63140c');
    });

    it('correctly decrypts a string', async () => {
        let val = await encryptor.encrypt('TheValueToEncrypt', password, iv);
        val = await encryptor.decrypt(val, password);
        expect(val).to.be.eql('TheValueToEncrypt');
    });

})
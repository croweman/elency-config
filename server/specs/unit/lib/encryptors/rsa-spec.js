const expect = require('chai').expect,
  encryptor = require('../../../../lib/encryptors/rsa'),
  fs = require('fs'),
  path = require('path');

describe('rsa public key lib', function() {

  it('correctly encrypts a string', async () => {
    const val = await encryptor.encrypt('TheValueToEncrypt', './specs/unit/lib/encryptors/public.pem');
    expect(val.length > 0).to.eql(true);
  });

  it('correctly decrypts a string', async () => {
    let val = await encryptor.encrypt('TheValueToEncrypt', './specs/unit/lib/encryptors/public.pem');
    expect(val.length > 0).to.eql(true);
    val = await encryptor.decrypt(val, './specs/unit/lib/encryptors/private.key');
    expect(val).to.be.eql('TheValueToEncrypt');
  });

  it('decryptFromPrivateKey - correctly decrypts a string', async () => {
    let val = await encryptor.encrypt('TheValueToEncrypt', './specs/unit/lib/encryptors/public.pem');
    expect(val.length > 0).to.eql(true);

    const absolutePath = path.resolve('specs/unit/lib/encryptors/private.key');
    const privateKey = fs.readFileSync(absolutePath, "utf8");
    val = await encryptor.decryptFromPrivateKey(val, privateKey);
    expect(val).to.be.eql('TheValueToEncrypt');
  });

  it('decryptFromPrivateKey - returns an error if private key invalid', async () => {
    let val = await encryptor.encrypt('TheValueToEncrypt', './specs/unit/lib/encryptors/public.pem');
    expect(val.length > 0).to.eql(true);

    const absolutePath = path.resolve('specs/unit/lib/encryptors/private.key');
    const privateKey = fs.readFileSync(absolutePath, "utf8");
    val = await encryptor.decryptFromPrivateKey(val, 'a' + privateKey);
    expect(val).to.be.eql('elency-config:DecodingError');
  });

})
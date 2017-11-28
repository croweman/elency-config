const crypto = require('crypto'),
  algorithm = 'aes-256-ctr';

async function encrypt(value, password){
    const cipher = crypto.createCipher(algorithm, password);
    let crypted = cipher.update(value, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

async function decrypt(value, password){
    const decipher = crypto.createDecipher(algorithm, password);
    let dec = decipher.update(value, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

module.exports = {
    encrypt,
    decrypt
};
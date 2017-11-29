const crypto = require('crypto'),
  algorithm = 'aes-256-ctr';

const hexIV = '5d71d70367921ad4c35644c6cf451a3c';
const iv = Buffer.from(hexIV, 'hex').slice(0, 16);

async function encrypt(value, password){
    const cipher = crypto.createCipheriv(algorithm, password, iv);
    let crypted = cipher.update(value, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

async function decrypt(value, password){
    const decipher = crypto.createDecipheriv(algorithm, password, iv);
    let dec = decipher.update(value, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

module.exports = {
    encrypt,
    decrypt
};
const uuid = require('uuid').v4;

const tokenLifeInSeconds = 20;

class Token {
  constructor(obj) {
    var obj = obj || {};

    let expires = obj.expires;
    let accessToken = obj.accessToken;

    if (!obj.dbPopulation) {
      if (!expires) {
        expires = new Date();
        expires.setSeconds(expires.getSeconds() + tokenLifeInSeconds);
      }

      accessToken = accessToken || uuid();
    }

    this.accessToken = accessToken;
    this.expires = expires;
  }

  isNull() {
    return this.accessToken === undefined || this.accessToken.trim().length === 0;
  }
}

module.exports = Token;
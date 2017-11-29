const uuid = require('uuid').v4;
const keyLength = process.env.KEY_LENGTH ? parseInt(process.env.KEY_LENGTH) : 32;

function generateId() {
  let id = uuid().replace(/-/g, '');

  while (id.length < keyLength) {
    id += uuid().replace(/-/g, '');
  }

  return id;
}

function generateBase64Key(id) {
  let base64Key = new Buffer(id).toString('base64');
  while (base64Key.length !== keyLength) {
    id = id.slice(0, -1);
    base64Key = new Buffer(id).toString('base64');
  }
  return base64Key;
}

console.log(`Key (${keyLength} characters):`);
console.log(generateBase64Key(generateId()));
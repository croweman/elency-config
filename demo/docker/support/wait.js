const http = require('http');
const path = require('path');
const { writeFileSync } = require('fs');

const serverUrl = 'http://app:3000/private/ping';

async function sleep() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
}

function isServerUp() {
  return new Promise((resolve, reject) => {
    http.get(serverUrl, (res) => {
      if (res.statusCode === 200) {
        return resolve();
      }
      return reject();
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function waitForServer() {
  const attempts = 20;
  let attempt = 0;
  let up = false;
  while (attempt <= attempts) {
    try {
      attempt++;
      await isServerUp();
      up = true;
      break;
    } catch (err) {
      await sleep();
    }
  }

  if (!up) {
    throw new Error('server did not come up')
  }
}

console.log('=====================');
console.log('Waiting for "elency-config-server" to become available');
waitForServer()
  .then(() => {
    console.log('Server now available');
    console.log('=====================');
    console.log();
    const filePath = path.join(__dirname, 'status', 'server-up.txt');
    writeFileSync(filePath, '');
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    console.log('Server did not come up');
    console.log('=====================');
    console.log();
    process.exit(1);
  });
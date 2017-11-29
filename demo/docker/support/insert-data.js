const fs = require('fs');
const path = require('path');
const repositories = require('./lib/repositories');
const mongoData = require('./data.js');

const mongoUrl = 'mongodb://mongodb:27017/elency-config';

async function deleteExistingMongoData(repos) {
  await repos.app.removeAll();
  await repos.appEnvironment.removeAll();
  await repos.audit.removeAll();
  await repos.configuration.removeAll();
  await repos.configRetrieval.removeAll();
  await repos.key.removeAll();
  await repos.role.removeAll();
  await repos.settings.removeAll();
  await repos.team.removeAll();
  await repos.token.removeAll();
  await repos.user.removeAll();
}

async function insertMongoData(repos) {
  await repos.app.addMany(mongoData.app);
  await repos.appEnvironment.addMany(mongoData.appEnvironment);
  await repos.configuration.addMany(mongoData.configuration);
  await repos.key.addMany(mongoData.key);
  await repos.role.addMany(mongoData.role);
  await repos.team.addMany(mongoData.team);
  await repos.user.addMany(mongoData.user);
  await repos.audit.addMany(mongoData.audit);
  await repos.settings.add(mongoData.settings[0]);
}

async function sleep() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
}

async function setupDemo() {
  const attempts = 20;
  let attempt = 0;
  let repos;

  console.log('=====================');
  console.log('Demo - Data setup');
  console.log('Waiting for Mongo data repository to become available')

  while (attempt <= attempts) {
    try {
      attempt++;
      repos = await repositories({ mongoUrl });
      break;
    } catch (err) {
      await sleep();
    }
  }

  if (!repos) {
    console.log('Mongo data repository did not become available, try restarting the "elency-config-client-demo" container');
    console.log('=====================');
    console.log();
    process.exit(1);
  }

  const filePath = path.join(__dirname, 'data-inserted');
  
  if (!fs.existsSync(filePath)) {
    await deleteExistingMongoData(repos);
    await insertMongoData(repos);
    fs.writeFileSync(filePath, '');
  }
}

setupDemo()
  .then(() => {
    console.log('Demo data has been inserted');
    console.log('=====================');
    console.log();
    process.exit(0);
  })
  .catch((err) => {
    console.log('An error occurred while inserting demo data', err);
    console.log('=====================');
    console.log();
    process.exit(1);
  });
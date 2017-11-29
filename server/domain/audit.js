const models = require('../models');

let repos;

async function addEntry(user, action, data) {
  
  const entry = new models.audit({
    action,
    data,
    changed: new Date(),
    changedBy: {
      userId: user.userId,
      userName: user.userName
    }
  });

  await repos.audit.add(entry);
}

module.exports = (repositories) => {
  repos = repositories;

  return {
    addEntry
  };
};


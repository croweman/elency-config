const logger = require('../logger');

let token;

async function process(req, res, next) {

  try {
    if (!req.headers || !req.headers['x-access-token'] || typeof req.headers['x-access-token'] !== 'string' || req.headers['x-access-token'].length === 0) {
      return res.sendStatus(401);
    }

    const accessToken = await token.find(req.headers['x-access-token']);

    if (accessToken !== undefined && accessToken.accessToken !== undefined && accessToken.accessToken.length > 0) {
      await token.remove(accessToken.accessToken);
      next();
    }
    else {
      return res.sendStatus(403);
    }
  }
  catch (err) {
    logger.error(err);
    return res.sendStatus(403);
  }
}

module.exports = (repos) => {
  token = repos.token;
  return process;
};

const constants = require('../constants');
const logger = require('../logger');

let repo;
let adminUserExists = false;

function getOriginalUrl(originalUrl) {
  originalUrl = originalUrl.toLowerCase().trim();

  if (originalUrl.indexOf('?') !== -1) {
    originalUrl = originalUrl.substring(0, originalUrl.indexOf('?'));
  }

  return originalUrl.replace(/(\/)+$/, '');
}

function redirectToLogin(req, res, originalUrl) {
  if (req.session) {
    req.session.returnTo = originalUrl;
  }

  return res.redirect('/login');
}

async function process(req, res, next) {

  try {
    const originalUrl = getOriginalUrl(req.originalUrl);

    let updatedUrl = originalUrl;

    if (updatedUrl.indexOf('?') !== -1) {
      updatedUrl = updatedUrl.substr(0, updatedUrl.indexOf('?'));
    }

    if (updatedUrl.endsWith('/login') === true ||
      updatedUrl.endsWith('/logout') === true) {
      return next();
    }

    if (req.isAuthenticated()) {

      const user = req.user;

      if (user.isNull() || user.enabled !== true) {
        return redirectToLogin(req, res, req.originalUrl);
      }

      next();
    }
    else {
      if (!adminUserExists) {
        let user = await repo.find(constants.adminUserId);
        
        if (user.isNull()) {
          return res.redirect('/createAdminUser');
        }

        adminUserExists = true;
        return redirectToLogin(req, res, req.originalUrl);
      }
      else {
        return redirectToLogin(req, res, req.originalUrl);
      }
    }
  }
  catch (err) {
    logger.error(err);

    try {
      return await res.renderError();
    }
    catch (err) {
      return await res.renderErrorNoState();
    }
  }
}

module.exports = (repos) => {
  repo = repos.user;
  return process;
};
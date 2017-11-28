const logger = require('../logger');

module.exports = (authorizer) => {

  return async (req, res, next) => {

    try {
      if (!req.user || req.user.isNull() || !req.user.enabled) {
        return res.renderUnauthorized();
      }
      
      const result = await authorizer(req.user, req.params || {});
      
      if (result === true) {
        return next();
      }

      return res.renderUnauthorized();
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
  };
};
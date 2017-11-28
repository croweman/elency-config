const viewDataExtender = require('../view-data-extender');

let repos;
let viewDataExtenderInstance;

function renderView(req, res) {
  return async function (options) {
    options = options || {};
    const statusCode = options.statusCode || 200;
    const view = options.view || '';
    let viewData = options.viewData || {};
    viewData = await viewDataExtenderInstance.extend(viewData, req);
    return res.status(statusCode).render(view, viewData);
  }
}

function renderError(req, res) {
  return async function (viewData) {
    viewData = viewData || {};
    viewData = await viewDataExtenderInstance.extend(viewData, req);
    return res.status(500).render('error/error', viewData);
  }
}

function renderErrorNoState(req, res) {
  return async function (viewData) {
    viewData = viewData || {};
    viewData = await viewDataExtenderInstance.extendNoState(viewData, req);
    return res.status(500).render('error/error', viewData);
  }
}

function renderUnauthorized(req, res) {
  return async function (viewData) {
    viewData = viewData || {};
    viewData = await viewDataExtenderInstance.extend(viewData, req);
    return res.status(401).render('error/unauthorized', viewData);
  }
}

function process(req, res, next) {
  res.renderView = renderView(req, res);
  res.renderError = renderError(req, res);
  res.renderErrorNoState = renderErrorNoState(req, res);
  res.renderUnauthorized = renderUnauthorized(req, res);
  next();
}

module.exports = (repositories) => {

  repos = repositories;
  viewDataExtenderInstance = viewDataExtender(repos);

  return process;
};
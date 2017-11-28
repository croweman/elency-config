
function getRequestIp(req) {
  if (!req || !req.headers) {
    return '';
  }

  const xForwardedFor = req.headers['x-forwarded-for'];
  let ip;

  if (xForwardedFor) {
    ip = xForwardedFor.split(',')[0];
  } else if (req.connection && req.connection.remoteAddress) {
    ip = req.connection.remoteAddress;
  } else {
    ip = req.ip;
  }

  return ip || '';
}

module.exports = getRequestIp;
const bunyan = require('bunyan');

/**
 * Serializes an Express request object to a simple object
 * for logging
 *
 * @param {Express.Request} req
 * @returns {object}
 */
function reqSerializer(req) {
  return {
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    path: req.path,
    route: req.route,
    signedCookies: req.signedCookies,
    protocol: req.protocol,
    secure: req.secure,
    xhr: req.xhr
  };
}

/**
 * Creates an error logger with a serializer for Express Request
 * objects.
 *
 * @param {string} name Name of the logger
 */
function createErrorLogger(name) {
  return bunyan.createLogger({
    name,
    level: 'error',
    serializers: {
      req: reqSerializer
    }
  });
}

module.exports = {
  createErrorLogger,
  serializers: {
    reqSerializer
  }
};

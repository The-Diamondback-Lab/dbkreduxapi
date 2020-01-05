const bunyan = require('bunyan');
const fs = require('fs');

// Create log directory if need be
if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs');
}

const timestamp = new Date(Date.now())
  .toISOString()
  .replace(/:/g, '-');

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
 * Creates an logger with a serializer for Express Request
 * objects. By default, the level is set to error and the
 * logger outputs to `./log/{timestamp}-{name}-{level}.log`.
 * The value of `timestamp` will be a full ISO time string,
 * fixed to whenever this module is loaded in.
 *
 * @param {string} name Name of the logger
 * @param {Logger.LogLevel} level Logging level (see bunyan logger level
 * values for accepted values)
 */
function createLogger(name, level = 'error') {
  return bunyan.createLogger({
    name,
    level,
    serializers: {
      req: reqSerializer
    },
    streams: [{
      type: 'file',
      path: `./logs/${timestamp}-${name}-${level}.log`
    }]
  });
}

module.exports = {
  createLogger,
  serializers: {
    reqSerializer
  }
};

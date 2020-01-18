const bunyan = require('bunyan');
const fs = require('fs');

// Create log directory if need be
if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs');
}

const timestamp = new Date(Date.now())
  .toISOString()
  .replace(/:/g, '-');
const loggerNames = new Set();

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
 * Creates an logger with a serializer for Express Request objects. By default,
 * the level is set to `error` and the logger outputs to
 * `./log/{timestamp}.log`. The value of `timestamp` will be a full ISO
 * time string, fixed to whenever this module is loaded in.
 *
 * Duplicate logger names are not allowed.
 *
 * @param {string} name Name of the logger
 * @param {Logger.LogLevel} level Logging level (see bunyan logger level values
 * for accepted values)
 */
function createLogger(name, level) {
  if (loggerNames.has(name)) {
    throw new Error('Duplicate logger name');
  }

  loggerNames.add(name);

  return bunyan.createLogger({
    name,
    level: level || 'error',
    serializers: {
      req: reqSerializer
    },
    streams: [{
      type: 'file',
      path: `./logs/${timestamp}.log`
    }]
  });
}

module.exports = {
  createLogger,
  serializers: {
    reqSerializer
  }
};

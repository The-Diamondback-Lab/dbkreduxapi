const redis = require('redis');
require('dotenv').config();

const redisConf = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
};

let redisClient = null;

if (process.env.NODE_ENV !== 'production') {
  // Provide a very simple mock of the redis client
  redisClient = {
    get: (_, cb) => cb(null, null),
    // eslint-disable-next-line no-empty-function
    setex() {}
  };
} else {
  redisClient = redis.createClient(redisConf);
  redisClient.auth(process.env.REDIS_PWD);

  redisClient.on('connect', () => {
    console.log('[redis] Client connected');
  });

  redisClient.on("error", err => {
    console.log(`[redis] Error: ${err}`);
  });
}

module.exports = redisClient;

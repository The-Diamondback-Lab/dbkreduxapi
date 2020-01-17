const redis = require('redis');
require('dotenv').config();

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

let redisClient = null;

// If ALL Redis env vars are provided, then use an actual Redis client
if (REDIS_HOST && REDIS_PORT && REDIS_PASSWORD) {
  console.log(`[redis] HOST=${REDIS_HOST}`);
  console.log(`[redis] PORT=${REDIS_PORT}`);
  console.log(`[redis] PASSWORD=${REDIS_PASSWORD ? '*****' : '<undefined>'}`);
  redisClient = redis.createClient({
    host: REDIS_HOST,
    port: REDIS_PORT
  });
  redisClient.auth(REDIS_PASSWORD);

  redisClient.on('connect', () => {
    console.log('[redis] Client connected');
  });

  redisClient.on("error", err => {
    console.log(`[redis] Error: ${err}`);
  });
} else {
  console.log('[redis] Mocking client');
  // Provide a very simple mock of the redis client
  redisClient = {
    get: (_, cb) => cb(null, null),
    // eslint-disable-next-line no-empty-function
    setex() {}
  };
}

module.exports = redisClient;

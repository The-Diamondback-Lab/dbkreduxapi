const redis = require('redis');
require('dotenv').config();

const redisConf = {
  host: '3.92.94.94',
  port: '6379'
};

const redisClient = redis.createClient(redisConf);
redisClient.auth(process.env.REDISPWD);

redisClient.on('connect', () => {
  console.log('[redis] Client connected');
});

redisClient.on('error', err => {
  console.log(`[redis] Error: ${err}`);
});

module.exports = redisClient;

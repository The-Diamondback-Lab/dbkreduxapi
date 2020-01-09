const redis = require('redis');
require('dotenv').config();

let redisConf = {
  host: '3.92.94.94',
  port: '6379'
};

let redisClient = null;

if (process.env.NODE_ENV !== 'production') {
  redisClient = {
    get: (_, cb) => {
      cb(null, null)
    },
    setex: () => {}
  }
} else {
  redisClient = redis.createClient(redisConf);
  redisClient.auth(process.env.REDISPWD);

  redisClient.on('connect', function() {
    console.log('[redis] Client connected');
  });

  redisClient.on("error", function (err) {
    console.log("[redis] Error: " + err);
});
}

module.exports = redisClient;

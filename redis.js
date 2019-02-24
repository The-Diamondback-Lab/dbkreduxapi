const redis = require('redis');

let redisConf = {
  host: '3.92.94.94',
  port: '6379'
};

let redisClient = redis.createClient(redisConf);
redisClient.auth(process.env.REDISPWD);

redisClient.on('connect', function() {
  console.log('Redis client connected');
});

redisClient.on("error", function (err) {
  console.log("Error " + err);
});

module.exports = redisClient;

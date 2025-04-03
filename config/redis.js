const Redis = require("redis");

const redisClient = Redis.createClient({
  url: "redis://redis-cache:6379", // Service name from docker-compose
});

redisClient.on("error", (err) => console.error("Redis error:", err));

(async () => {
  await redisClient.connect();
  console.log("Connected to Redis");
})();

module.exports = redisClient;

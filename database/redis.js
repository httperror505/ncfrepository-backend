const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
  url: process.env.REDIS_URL, // Store the Redis connection URL in environment variables
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
};

connectRedis();

module.exports = redisClient;

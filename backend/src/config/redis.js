const Redis = require('ioredis');
const NodeCache = require('node-cache');

let redisClient = null;
let isRedisConnected = false;
const fallbackCache = new NodeCache();

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const initRedis = () => {
  return new Promise((resolve) => {
    console.log('Connecting to Redis...');
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy: (times) => {
        if (times > 2) {
          console.warn('Redis connection failed. Falling back to NodeCache.');
          isRedisConnected = false;
          resolve(null);
          return null; // stop retrying
        }
        return Math.min(times * 100, 2000);
      }
    });

    redisClient.on('connect', () => {
      console.log('Redis connected successfully.');
      isRedisConnected = true;
      resolve(redisClient);
    });

    redisClient.on('error', (err) => {
      console.warn(`Redis connection error: ${err.message}. Running fallback mode.`);
      isRedisConnected = false;
      resolve(null);
    });
  });
};

const getCache = async (key) => {
  if (isRedisConnected && redisClient) {
    try {
      const val = await redisClient.get(key);
      return val ? JSON.parse(val) : null;
    } catch (err) {
      console.error('Redis get error:', err);
    }
  }
  return fallbackCache.get(key);
};

const setCache = async (key, value, ttlSeconds) => {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      return;
    } catch (err) {
      console.error('Redis set error:', err);
    }
  }
  fallbackCache.set(key, value, ttlSeconds);
};

const clearCache = async (keyPrefix) => {
  if (isRedisConnected && redisClient) {
    try {
      const keys = await redisClient.keys(`${keyPrefix}*`);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
      return;
    } catch (err) {
      console.error('Redis del error:', err);
    }
  }
  const keys = fallbackCache.keys();
  const keysToDelete = keys.filter(k => k.includes(keyPrefix));
  if (keysToDelete.length > 0) {
    fallbackCache.del(keysToDelete);
  }
};

module.exports = {
  initRedis,
  getCache,
  setCache,
  clearCache,
  isRedisConnected: () => isRedisConnected,
  getRedisClient: () => redisClient
};

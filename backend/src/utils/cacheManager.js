import Redis from "ioredis";
import { logger } from "./logger.js";

let redisClient = null;
const memoryCache = new Map();

if (process.env.REDIS_URL && process.env.REDIS_URL !== "") {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      retryStrategy(times) {
        if (times > 3) {
          return null; // stop retrying
        }
        return Math.min(times * 50, 2000);
      },
    });
    redisClient.on("connect", () => {
      logger.info("Connected to external Redis cache.");
    });
    
    let hasLoggedError = false;
    redisClient.on("error", (err) => {
      if (!hasLoggedError) {
        logger.warn("Redis cache connection failed, falling back to in-memory caching", { error: err.message });
        hasLoggedError = true;
      }
    });
  } catch (err) {
    logger.warn("Failed to initialize Redis client, falling back to in-memory caching", { error: err.message });
  }
}

export const cacheManager = {
  /**
   * Get cached item by key
   */
  async get(key) {
    if (redisClient && redisClient.status === "ready") {
      try {
        const val = await redisClient.get(key);
        return val ? JSON.parse(val) : null;
      } catch (err) {
        logger.error("Redis get operation failed, trying in-memory fallback", { key, error: err.message });
      }
    }
    const memVal = memoryCache.get(key);
    if (memVal) {
      if (memVal.expiry > Date.now()) {
        return memVal.value;
      }
      memoryCache.delete(key);
    }
    return null;
  },

  /**
   * Set cached item with TTL in seconds
   */
  async set(key, value, ttlSeconds) {
    if (redisClient && redisClient.status === "ready") {
      try {
        await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
        return;
      } catch (err) {
        logger.error("Redis set operation failed, falling back to in-memory cache", { key, error: err.message });
      }
    }
    memoryCache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000),
    });
  },

  /**
   * Delete cached item by key
   */
  async del(key) {
    if (redisClient && redisClient.status === "ready") {
      try {
        await redisClient.del(key);
        return;
      } catch (err) {
        logger.error("Redis delete operation failed, falling back to in-memory cache", { key, error: err.message });
      }
    }
    memoryCache.delete(key);
  },

  /**
   * Clear all items in cache
   */
  async clear() {
    if (redisClient && redisClient.status === "ready") {
      try {
        await redisClient.flushdb();
        return;
      } catch (err) {
        logger.error("Redis flushdb operation failed, falling back to in-memory cache", { error: err.message });
      }
    }
    memoryCache.clear();
  }
};

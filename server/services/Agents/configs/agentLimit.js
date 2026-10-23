import redis from "../../../shared/redis/redis.js";

const LIMIT = 10; // Max requests per window
const WINDOW = 60; // Window in seconds

export const agentLimit = async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"] || req.ip;
    const key = `ratelimit:agent:${userId}`;

    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, WINDOW);
    } else {
      const ttl = await redis.ttl(key);
      if (ttl === -1) await redis.expire(key, WINDOW);
    }

    if (count > LIMIT) {
      const ttl = await redis.ttl(key);
      const retryAfter = ttl > 0 ? ttl : WINDOW;
      return res.status(429).json({
        success: false,
        message: `Too many requests. Please wait ${retryAfter}s before trying again.`,
        retryAfter,
      });
    }

    next();
  } catch (error) {
    console.error("Rate limit error:", error.message);
    next();
  }
};

export default agentLimit;

import Redis from "ioredis";
import "dotenv/config";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 150, 3000);
    return delay;
  },
  reconnectOnError(err) {
    const targetErrors = ["READONLY", "ETIMEDOUT", "ECONNRESET"];
    if (targetErrors.some((code) => err.message.includes(code))) {
      return true;
    }
    return false;
  },
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

export default redis;

 
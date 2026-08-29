import Redis from "ioredis";

// lazyConnect + these options are BullMQ's recommended settings so a
// momentarily-down Redis doesn't crash the process on boot.
const connection = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

connection.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

export default connection;

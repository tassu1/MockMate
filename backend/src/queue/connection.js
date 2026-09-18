import Redis from "ioredis";
import "dotenv/config";


const connection = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
connection.on("ready", async () => {
  console.log("🟢 Redis READY");
  console.log("Redis URL exists:", Boolean(process.env.REDIS_URL));

  const pong = await connection.ping();
  console.log("Redis PING:", pong);

  const db = await connection.info("keyspace");
  console.log("Redis KEYSPACE:", db);
});
connection.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});


export default connection;

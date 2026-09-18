import Redis from "ioredis";
import "dotenv/config";


connection.on("ready", async () => {
  console.log("🟢 Redis READY");
  console.log("Redis URL exists:", Boolean(process.env.REDIS_URL));

  const pong = await connection.ping();
  console.log("Redis PING:", pong);

  const db = await connection.info("keyspace");
  console.log("Redis KEYSPACE:", db);
});

export default connection;

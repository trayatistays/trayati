import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { redis } from "../src/lib/redis";

async function testRedis() {
  console.log("Testing Redis connection...");
  try {
    await redis.set("test_key", "Hello from Trayati!");
    const val = await redis.get("test_key");
    console.log("Redis Response:", val);
    if (val === "Hello from Trayati!") {
      console.log("SUCCESS: Redis is working!");
    } else {
      console.log("FAILURE: Unexpected response.");
    }
  } catch (err) {
    console.error("ERROR: Failed to connect to Redis.", err);
  }
}

testRedis();

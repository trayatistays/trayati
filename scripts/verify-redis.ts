import { Redis } from "@upstash/redis";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function testRedis() {
  console.log("Testing Redis connection with inline client...");
  
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.error("Missing keys in .env.local");
    return;
  }

  const redis = new Redis({ url, token });

  try {
    await redis.set("test_key_inline", "Success!");
    const val = await redis.get("test_key_inline");
    console.log("Redis Response:", val);
    if (val === "Success!") {
      console.log("VERIFIED: Upstash Redis is connected and working.");
    }
  } catch (err) {
    console.error("VERIFICATION FAILED:", err);
  }
}

testRedis();

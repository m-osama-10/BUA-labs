import { getDb } from "./server/db";

async function test() {
  const db = await getDb();
  if (db) {
    // Test selecting all devices
    console.log("Testing listDevices...");
    const result = await db.execute(
      `SELECT COUNT(*) as cnt FROM devices`
    );
    console.log("Result:", result);
  } else {
    console.log("DB not available");
  }
}

test().catch(console.error);

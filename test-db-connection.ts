import { getDb } from "./server/db";
import { departments, laboratories } from "./drizzle/schema";

async function test() {
  console.log("Testing database connection...");
  const db = await getDb();
  
  if (!db) {
    console.error("❌ DB connection failed");
    process.exit(1);
  }
  
  console.log("✅ DB connected");
  
  // Test getAllDepartments
  try {
    const result = await db.select().from(departments).limit(5);
    console.log("✅ Departments:", result);
  } catch (err) {
    console.error("❌ Error fetching departments:", err);
  }
  
  // Test getAllLaboratories
  try {
    const result = await db.select().from(laboratories).limit(5);
    console.log("✅ Laboratories:", result);
  } catch (err) {
    console.error("❌ Error fetching laboratories:", err);
  }
}

test().catch(console.error);

/**
 * Seed script to add initial faculties to the database
 * Run with: npx tsx seed-faculties.ts
 */

import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { faculties } from "./drizzle/schema";
import mysql from "mysql2/promise";

const FACULTIES = [
  { name: "كلية الصيدلة", code: "PHARM" },
  { name: "كلية طب الفم والأسنان", code: "DENT" },
  { name: "كلية الطب البيطري", code: "VET" },
  { name: "كلية التمريض", code: "NURS" },
  { name: "كلية العلاج الطبيعي", code: "PT" },
  { name: "كلية العلوم الصحية", code: "HS" },
  { name: "كلية البيوتكنولوجيا", code: "BIO" },
  { name: "كلية الطب البشري", code: "MED" },
  { name: "كلية الهندسة", code: "ENG" },
  { name: "كلية العلوم", code: "SCI" },
  { name: "كلية الآداب", code: "ART" },
  { name: "كلية التربية", code: "EDU" },
];

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
  });

  const db = drizzle(connection);

  console.log("🌱 Adding faculties...");

  try {
    for (const faculty of FACULTIES) {
      try {
        // Check if exists
        const [result] = await connection.execute(
          "SELECT id FROM faculties WHERE code = ?",
          [faculty.code]
        ) as any;

        if (result && result.length === 0) {
          await db.insert(faculties).values({
            name: faculty.name,
            code: faculty.code,
          });
          console.log(`✅ Added: ${faculty.name}`);
        } else {
          console.log(`⏭️  Skipped: ${faculty.name} (already exists)`);
        }
      } catch (error) {
        console.error(`Error processing faculty ${faculty.name}:`, error);
      }
    }

    console.log("\n✨ Done!");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await connection.end();
    process.exit(0);
  }
}

seed();
// single invocation

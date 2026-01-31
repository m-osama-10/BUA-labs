/**
 * Simple script to seed faculties to database
 * This approach uses direct drizzle calls without needing mysql connection setup
 */

import "dotenv/config";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { faculties } from "./drizzle/schema";
import { eq } from "drizzle-orm";

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

async function seedFaculties() {
  let connection;
  try {
    console.log("📝 Attempting to seed faculties...");
    console.log(`DB Host: ${process.env.DB_HOST || "localhost"}`);
    console.log(`DB Name: ${process.env.DB_NAME}`);

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME,
    });

    const db = drizzle(connection);

    console.log("✅ Database connected");
    console.log(`🌱 Seeding ${FACULTIES.length} faculties...`);

    let added = 0;
    let skipped = 0;

    for (const faculty of FACULTIES) {
      try {
        // Check if faculty already exists
        const existing = await db
          .select()
          .from(faculties)
          .where(eq(faculties.code, faculty.code))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(faculties).values({
            name: faculty.name,
            code: faculty.code,
          });
          console.log(`  ✅ Added: ${faculty.name} (${faculty.code})`);
          added++;
        } else {
          console.log(`  ⏭️  Exists: ${faculty.name} (${faculty.code})`);
          skipped++;
        }
      } catch (error) {
        console.error(`  ❌ Error with ${faculty.name}:`, error);
      }
    }

    console.log(`\n✨ Seeding complete!`);
    console.log(`  Added: ${added}`);
    console.log(`  Skipped: ${skipped}`);
    console.log(`  Total: ${added + skipped}/${FACULTIES.length}`);

  } catch (error) {
    console.error("❌ Connection error:", error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

seedFaculties();

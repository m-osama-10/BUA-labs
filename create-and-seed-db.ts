/**
 * Create database and seed 8 faculties
 * This script creates the database first, then seeds the data
 * Run with: npx tsx create-and-seed-db.ts
 */

import "dotenv/config";
import mysql from "mysql2/promise";

const SQL_STATEMENTS = [
  // Create database
  `CREATE DATABASE IF NOT EXISTS bua_assets CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,

  // Insert faculties
  `INSERT IGNORE INTO bua_assets.faculties (id, name, code, createdAt, updatedAt) VALUES
    (1, 'كلية الصيدلة', 'PHARM', NOW(), NOW()),
    (2, 'كلية طب الفم والأسنان', 'DENT', NOW(), NOW()),
    (3, 'كلية الطب البيطري', 'VET', NOW(), NOW()),
    (4, 'كلية العلاج الطبيعي', 'PT', NOW(), NOW()),
    (5, 'كلية التمريض', 'NURS', NOW(), NOW()),
    (6, 'كلية البيوتكنولوجيا', 'BIO', NOW(), NOW()),
    (7, 'كلية الطب البشري', 'MED', NOW(), NOW()),
    (8, 'كلية العلوم الصحية', 'HS', NOW(), NOW());`,

  // Insert departments
  `INSERT IGNORE INTO bua_assets.departments (id, facultyId, name, code, createdAt, updatedAt) VALUES
    (1, 1, 'قسم الصيدلة الإكلينيكية', 'PHARM-CL', NOW(), NOW()),
    (2, 1, 'قسم الصيدلة الصناعية', 'PHARM-IND', NOW(), NOW()),
    (3, 1, 'قسم الكيمياء الدوائية', 'PHARM-CHEM', NOW(), NOW()),
    (4, 2, 'قسم طب الأسنان العام', 'DENT-GEN', NOW(), NOW()),
    (5, 2, 'قسم طب الأسنان التحفظي', 'DENT-CONS', NOW(), NOW()),
    (6, 2, 'قسم جراحة الفم والفكين', 'DENT-SURG', NOW(), NOW()),
    (7, 3, 'قسم الطب الباطني البيطري', 'VET-INT', NOW(), NOW()),
    (8, 3, 'قسم الجراحة البيطرية', 'VET-SURG', NOW(), NOW()),
    (9, 3, 'قسم الإنتاج الحيواني', 'VET-PROD', NOW(), NOW()),
    (10, 4, 'قسم العلاج الطبيعي العام', 'PT-GEN', NOW(), NOW()),
    (11, 4, 'قسم إعادة التأهيل', 'PT-REHAB', NOW(), NOW()),
    (12, 5, 'قسم التمريض السريري', 'NURS-CL', NOW(), NOW()),
    (13, 5, 'قسم تمريض المجتمع', 'NURS-COM', NOW(), NOW()),
    (14, 6, 'قسم الهندسة الوراثية', 'BIO-GEN', NOW(), NOW()),
    (15, 6, 'قسم البيولوجيا الجزيئية', 'BIO-MOL', NOW(), NOW()),
    (16, 7, 'قسم الطب الباطني', 'MED-INT', NOW(), NOW()),
    (17, 7, 'قسم الجراحة العامة', 'MED-SURG', NOW(), NOW()),
    (18, 7, 'قسم طب الأطفال', 'MED-PED', NOW(), NOW()),
    (19, 8, 'قسم الصحة العامة', 'HS-PH', NOW(), NOW()),
    (20, 8, 'قسم علوم التغذية', 'HS-NUTR', NOW(), NOW()),
    (21, 8, 'قسم المختبرات الطبية', 'HS-LAB', NOW(), NOW());`,

  // Insert laboratories
  `INSERT IGNORE INTO bua_assets.laboratories (id, departmentId, name, code, location, createdAt, updatedAt) VALUES
    (1, 1, 'مختبر الصيدلة الإكلينيكية 1', 'PHARM-CL-LAB1', 'المبنى A - الطابق 2', NOW(), NOW()),
    (2, 1, 'مختبر الصيدلة الإكلينيكية 2', 'PHARM-CL-LAB2', 'المبنى A - الطابق 3', NOW(), NOW()),
    (3, 2, 'مختبر الصيدلة الصناعية', 'PHARM-IND-LAB', 'المبنى B - الطابق 1', NOW(), NOW()),
    (4, 3, 'مختبر الكيمياء الدوائية', 'PHARM-CHEM-LAB', 'المبنى C - الطابق 2', NOW(), NOW()),
    (5, 4, 'عيادة طب الأسنان العام 1', 'DENT-GEN-CL1', 'المبنى D - الطابق 1', NOW(), NOW()),
    (6, 4, 'عيادة طب الأسنان العام 2', 'DENT-GEN-CL2', 'المبنى D - الطابق 2', NOW(), NOW()),
    (7, 5, 'عيادة التحفظي', 'DENT-CONS-CL', 'المبنى D - الطابق 3', NOW(), NOW()),
    (8, 6, 'غرفة جراحة الفم', 'DENT-SURG-OR', 'المبنى D - الطابق 4', NOW(), NOW()),
    (9, 7, 'عيادة الطب الباطني', 'VET-INT-CL', 'المبنى E - الطابق 1', NOW(), NOW()),
    (10, 8, 'غرفة الجراحة البيطرية', 'VET-SURG-OR', 'المبنى E - الطابق 2', NOW(), NOW()),
    (11, 9, 'مختبر الإنتاج الحيواني', 'VET-PROD-LAB', 'المبنى E - الطابق 3', NOW(), NOW()),
    (12, 10, 'قاعة العلاج الطبيعي', 'PT-GEN-HALL', 'المبنى F - الطابق 1', NOW(), NOW()),
    (13, 11, 'مركز إعادة التأهيل', 'PT-REHAB-CTR', 'المبنى F - الطابق 2', NOW(), NOW()),
    (14, 12, 'قاعة التمريض السريري', 'NURS-CL-HALL', 'المبنى G - الطابق 1', NOW(), NOW()),
    (15, 13, 'مختبر تمريض المجتمع', 'NURS-COM-LAB', 'المبنى G - الطابق 2', NOW(), NOW()),
    (16, 14, 'مختبر الهندسة الوراثية', 'BIO-GEN-LAB', 'المبنى H - الطابق 1', NOW(), NOW()),
    (17, 15, 'مختبر البيولوجيا الجزيئية', 'BIO-MOL-LAB', 'المبنى H - الطابق 2', NOW(), NOW()),
    (18, 16, 'عيادة الطب الباطني', 'MED-INT-CL', 'المبنى I - الطابق 1', NOW(), NOW()),
    (19, 17, 'غرفة الجراحة العامة', 'MED-SURG-OR', 'المبنى I - الطابق 2', NOW(), NOW()),
    (20, 18, 'عيادة طب الأطفال', 'MED-PED-CL', 'المبنى I - الطابق 3', NOW(), NOW()),
    (21, 19, 'مختبر الصحة العامة', 'HS-PH-LAB', 'المبنى J - الطابق 1', NOW(), NOW()),
    (22, 20, 'مختبر علوم التغذية', 'HS-NUTR-LAB', 'المبنى J - الطابق 2', NOW(), NOW()),
    (23, 21, 'مختبر المختبرات الطبية', 'HS-LAB-LAB', 'المبنى J - الطابق 3', NOW(), NOW());`,
];

async function createAndSeedDatabase() {
  let connection;
  try {
    console.log("📝 جاري محاولة الاتصال بـ MySQL...");
    console.log("📝 Attempting to connect to MySQL...\n");

    // First connection without database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });

    console.log("✅ تم الاتصال بـ MySQL بنجاح");
    console.log("✅ Connected to MySQL successfully\n");

    console.log("🗄️  جاري إنشاء قاعدة البيانات والبيانات الأولية...");
    console.log("🗄️  Creating database and seeding data...\n");

    // Execute each statement
    for (let i = 0; i < SQL_STATEMENTS.length; i++) {
      const statement = SQL_STATEMENTS[i];
      try {
        await connection.query(statement);
        const stepNames = [
          "📦 قاعدة البيانات",
          "📚 الكليات",
          "📖 الأقسام",
          "🏛️  المختبرات",
        ];
        console.log(`✅ ${stepNames[i] || "خطوة"} - تم بنجاح`);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`❌ خطأ في الخطوة ${i}:`, error.message);
        }
      }
    }

    // Verify data
    console.log("\n📊 جاري التحقق من البيانات...");
    const [faculties] = await connection.query(
      "SELECT COUNT(*) as count FROM bua_assets.faculties"
    ) as any[];
    const [departments] = await connection.query(
      "SELECT COUNT(*) as count FROM bua_assets.departments"
    ) as any[];
    const [labs] = await connection.query(
      "SELECT COUNT(*) as count FROM bua_assets.laboratories"
    ) as any[];

    console.log(`✅ الكليات: ${faculties[0].count}`);
    console.log(`✅ الأقسام: ${departments[0].count}`);
    console.log(`✅ المختبرات: ${labs[0].count}\n`);

    console.log(`🎉 تم إنشاء قاعدة البيانات بنجاح!`);
    console.log(`🎉 Database created successfully!\n`);
    console.log(`📝 الخطوات التالية:`);
    console.log(`   1. شغّل التطبيق: npm run dev`);
    console.log(`   2. افتح: http://localhost:3000/devices/new`);
    console.log(`   3. ستظهر الـ 8 كليات! 🚀`);

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        console.error("❌ خطأ: MySQL Server لا يعمل");
        console.error("❌ Error: MySQL Server is not running");
        console.error("\n📝 الحل:");
        console.error("   Windows: ابحث عن MySQL80 في Services وشغّله");
        console.error("   Windows: Search for MySQL80 in Services and start it");
      } else if (error.message.includes("Access denied")) {
        console.error("❌ خطأ: خطأ في كلمة المرور");
        console.error("❌ Error: Wrong password");
        console.error("\n📝 عدّل .env بقيمة DB_PASSWORD الصحيحة");
      } else {
        console.error("❌ خطأ:", error.message);
      }
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAndSeedDatabase().then(() => process.exit(0));

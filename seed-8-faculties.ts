/**
 * Seed database with 8 faculties, departments, and laboratories
 * Run with: npx tsx seed-8-faculties.ts
 */

import "dotenv/config";
import mysql from "mysql2/promise";

const SEED_SQL = `
-- Insert 8 faculties
INSERT INTO \`faculties\` (\`name\`, \`code\`, \`createdAt\`, \`updatedAt\`) VALUES
('كلية الصيدلة', 'PHARM', NOW(), NOW()),
('كلية طب الفم والأسنان', 'DENT', NOW(), NOW()),
('كلية الطب البيطري', 'VET', NOW(), NOW()),
('كلية العلاج الطبيعي', 'PT', NOW(), NOW()),
('كلية التمريض', 'NURS', NOW(), NOW()),
('كلية البيوتكنولوجيا', 'BIO', NOW(), NOW()),
('كلية الطب البشري', 'MED', NOW(), NOW()),
('كلية العلوم الصحية', 'HS', NOW(), NOW());

-- Insert departments for PHARM
INSERT INTO \`departments\` (\`facultyId\`, \`name\`, \`code\`, \`createdAt\`, \`updatedAt\`) VALUES
(1, 'قسم الصيدلة الإكلينيكية', 'PHARM-CL', NOW(), NOW()),
(1, 'قسم الصيدلة الصناعية', 'PHARM-IND', NOW(), NOW()),
(1, 'قسم الكيمياء الدوائية', 'PHARM-CHEM', NOW(), NOW());

-- Insert departments for DENT
INSERT INTO \`departments\` (\`facultyId\`, \`name\`, \`code\`, \`createdAt\`, \`updatedAt\`) VALUES
(2, 'قسم طب الأسنان العام', 'DENT-GEN', NOW(), NOW()),
(2, 'قسم طب الأسنان التحفظي', 'DENT-CONS', NOW(), NOW()),
(2, 'قسم جراحة الفم والفكين', 'DENT-SURG', NOW(), NOW());

-- Insert departments for VET
INSERT INTO \`departments\` (\`facultyId\`, \`name\`, \`code\`, \`createdAt\`, \`updatedAt\`) VALUES
(3, 'قسم الطب الباطني البيطري', 'VET-INT', NOW(), NOW()),
(3, 'قسم الجراحة البيطرية', 'VET-SURG', NOW(), NOW()),
(3, 'قسم الإنتاج الحيواني', 'VET-PROD', NOW(), NOW());

-- Insert departments for PT
INSERT INTO \`departments\` (\`facultyId\`, \`name\`, \`code\`, \`createdAt\`, \`updatedAt\`) VALUES
(4, 'قسم العلاج الطبيعي العام', 'PT-GEN', NOW(), NOW()),
(4, 'قسم إعادة التأهيل', 'PT-REHAB', NOW(), NOW());

-- Insert departments for NURS
INSERT INTO \`departments\` (\`facultyId\`, \`name\`, \`code\`, \`createdAt\`, \`updatedAt\`) VALUES
(5, 'قسم التمريض السريري', 'NURS-CL', NOW(), NOW()),
(5, 'قسم تمريض المجتمع', 'NURS-COM', NOW(), NOW());

-- Insert departments for BIO
INSERT INTO \`departments\` (\`facultyId\`, \`name\`, \`code\`, \`createdAt\`, \`updatedAt\`) VALUES
(6, 'قسم الهندسة الوراثية', 'BIO-GEN', NOW(), NOW()),
(6, 'قسم البيولوجيا الجزيئية', 'BIO-MOL', NOW(), NOW());

-- Insert departments for MED
INSERT INTO \`departments\` (\`facultyId\`, \`name\`, \`code\`, \`createdAt\`, \`updatedAt\`) VALUES
(7, 'قسم الطب الباطني', 'MED-INT', NOW(), NOW()),
(7, 'قسم الجراحة العامة', 'MED-SURG', NOW(), NOW()),
(7, 'قسم طب الأطفال', 'MED-PED', NOW(), NOW());

-- Insert departments for HS
INSERT INTO \`departments\` (\`facultyId\`, \`name\`, \`code\`, \`createdAt\`, \`updatedAt\`) VALUES
(8, 'قسم الصحة العامة', 'HS-PH', NOW(), NOW()),
(8, 'قسم علوم التغذية', 'HS-NUTR', NOW(), NOW()),
(8, 'قسم المختبرات الطبية', 'HS-LAB', NOW(), NOW());

-- Insert laboratories for PHARM departments
INSERT INTO \`laboratories\` (\`departmentId\`, \`name\`, \`code\`, \`location\`, \`createdAt\`, \`updatedAt\`) VALUES
(1, 'مختبر الصيدلة الإكلينيكية 1', 'PHARM-CL-LAB1', 'المبنى A - الطابق 2', NOW(), NOW()),
(1, 'مختبر الصيدلة الإكلينيكية 2', 'PHARM-CL-LAB2', 'المبنى A - الطابق 3', NOW(), NOW()),
(2, 'مختبر الصيدلة الصناعية', 'PHARM-IND-LAB', 'المبنى B - الطابق 1', NOW(), NOW()),
(3, 'مختبر الكيمياء الدوائية', 'PHARM-CHEM-LAB', 'المبنى C - الطابق 2', NOW(), NOW());

-- Insert laboratories for DENT departments
INSERT INTO \`laboratories\` (\`departmentId\`, \`name\`, \`code\`, \`location\`, \`createdAt\`, \`updatedAt\`) VALUES
(4, 'عيادة طب الأسنان العام 1', 'DENT-GEN-CL1', 'المبنى D - الطابق 1', NOW(), NOW()),
(4, 'عيادة طب الأسنان العام 2', 'DENT-GEN-CL2', 'المبنى D - الطابق 2', NOW(), NOW()),
(5, 'عيادة التحفظي', 'DENT-CONS-CL', 'المبنى D - الطابق 3', NOW(), NOW()),
(6, 'غرفة جراحة الفم', 'DENT-SURG-OR', 'المبنى D - الطابق 4', NOW(), NOW());

-- Insert laboratories for VET departments
INSERT INTO \`laboratories\` (\`departmentId\`, \`name\`, \`code\`, \`location\`, \`createdAt\`, \`updatedAt\`) VALUES
(7, 'عيادة الطب الباطني', 'VET-INT-CL', 'المبنى E - الطابق 1', NOW(), NOW()),
(8, 'غرفة الجراحة البيطرية', 'VET-SURG-OR', 'المبنى E - الطابق 2', NOW(), NOW()),
(9, 'مختبر الإنتاج الحيواني', 'VET-PROD-LAB', 'المبنى E - الطابق 3', NOW(), NOW());

-- Insert laboratories for PT departments
INSERT INTO \`laboratories\` (\`departmentId\`, \`name\`, \`code\`, \`location\`, \`createdAt\`, \`updatedAt\`) VALUES
(10, 'قاعة العلاج الطبيعي', 'PT-GEN-HALL', 'المبنى F - الطابق 1', NOW(), NOW()),
(11, 'مركز إعادة التأهيل', 'PT-REHAB-CTR', 'المبنى F - الطابق 2', NOW(), NOW());

-- Insert laboratories for NURS departments
INSERT INTO \`laboratories\` (\`departmentId\`, \`name\`, \`code\`, \`location\`, \`createdAt\`, \`updatedAt\`) VALUES
(12, 'قاعة التمريض السريري', 'NURS-CL-HALL', 'المبنى G - الطابق 1', NOW(), NOW()),
(13, 'مختبر تمريض المجتمع', 'NURS-COM-LAB', 'المبنى G - الطابق 2', NOW(), NOW());

-- Insert laboratories for BIO departments
INSERT INTO \`laboratories\` (\`departmentId\`, \`name\`, \`code\`, \`location\`, \`createdAt\`, \`updatedAt\`) VALUES
(14, 'مختبر الهندسة الوراثية', 'BIO-GEN-LAB', 'المبنى H - الطابق 1', NOW(), NOW()),
(15, 'مختبر البيولوجيا الجزيئية', 'BIO-MOL-LAB', 'المبنى H - الطابق 2', NOW(), NOW());

-- Insert laboratories for MED departments
INSERT INTO \`laboratories\` (\`departmentId\`, \`name\`, \`code\`, \`location\`, \`createdAt\`, \`updatedAt\`) VALUES
(16, 'عيادة الطب الباطني', 'MED-INT-CL', 'المبنى I - الطابق 1', NOW(), NOW()),
(17, 'غرفة الجراحة العامة', 'MED-SURG-OR', 'المبنى I - الطابق 2', NOW(), NOW()),
(18, 'عيادة طب الأطفال', 'MED-PED-CL', 'المبنى I - الطابق 3', NOW(), NOW());

-- Insert laboratories for HS departments
INSERT INTO \`laboratories\` (\`departmentId\`, \`name\`, \`code\`, \`location\`, \`createdAt\`, \`updatedAt\`) VALUES
(19, 'مختبر الصحة العامة', 'HS-PH-LAB', 'المبنى J - الطابق 1', NOW(), NOW()),
(20, 'مختبر علوم التغذية', 'HS-NUTR-LAB', 'المبنى J - الطابق 2', NOW(), NOW()),
(21, 'مختبر المختبرات الطبية', 'HS-LAB-LAB', 'المبنى J - الطابق 3', NOW(), NOW());
`;

async function seedFaculties() {
  let connection;
  try {
    console.log("📝 جاري محاولة بذر البيانات...");
    console.log("📝 Attempting to seed faculties...\n");
    
    const dbHost = process.env.DB_HOST || "localhost";
    const dbPort = parseInt(process.env.DB_PORT || "3306");
    const dbUser = process.env.DB_USER || "root";
    const dbPassword = process.env.DB_PASSWORD || "";
    const dbName = process.env.DB_NAME;

    if (!dbName) {
      console.error("❌ خطأ: DB_NAME لم يتم تعيينه");
      console.error("❌ Error: DB_NAME is not set");
      process.exit(1);
    }

    console.log(`🔌 Database Connection Info:`);
    console.log(`   Host: ${dbHost}:${dbPort}`);
    console.log(`   User: ${dbUser}`);
    console.log(`   Database: ${dbName}\n`);

    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      multipleStatements: true,
    });

    console.log("✅ تم الاتصال بقاعدة البيانات بنجاح");
    console.log("✅ Database connected successfully\n");
    
    console.log(`🌱 جاري بذر البيانات...`);
    console.log(`🌱 Seeding 8 faculties with departments and laboratories...\n`);

    // Execute all statements
    await connection.query(SEED_SQL);
    
    console.log(`✨ تم البذر بنجاح!`);
    console.log(`✨ Seeding complete!\n`);
    console.log(`📊 Summary:`);
    console.log(`   ✅ 8 كليات (8 Faculties)`);
    console.log(`   ✅ 20 قسم (20 Departments)`);
    console.log(`   ✅ 21 مختبر (21 Laboratories)\n`);
    console.log(`🎉 يمكنك الآن إضافة الأجهزة!`);
    console.log(`🎉 You can now add devices!`);

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("duplicate") || error.message.includes("Duplicate")) {
        console.log("⚠️  تحذير: البيانات موجودة بالفعل");
        console.log("⚠️  Warning: Data already exists");
      } else if (error.message.includes("ECONNREFUSED")) {
        console.error("❌ خطأ: لا يمكن الاتصال بـ MySQL");
        console.error("❌ Error: Cannot connect to MySQL");
        console.error("   - تأكد من أن MySQL قيد التشغيل");
        console.error("   - تحقق من قيم الاتصال في .env");
        process.exit(1);
      } else if (error.message.includes("Unknown database")) {
        console.error("❌ خطأ: قاعدة البيانات لا توجد");
        console.error("❌ Error: Database does not exist");
        console.error(`   - أنشئ: CREATE DATABASE ${process.env.DB_NAME};`);
        process.exit(1);
      } else {
        console.error("❌ خطأ:", error.message);
        process.exit(1);
      }
    }
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

seedFaculties();

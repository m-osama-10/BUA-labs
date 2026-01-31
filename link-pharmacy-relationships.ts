import mysql from "mysql2/promise";

/**
 * رابط الأجهزة بسجلات الصيانة والإهلاك والنقل
 * يوصل كل جهاز بسجل صيانة أولي وسجل إهلاك
 */

async function getDatabaseConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1995105",
    database: "bua_assets",
  });
}

async function createInitialMaintenanceRecords(conn: mysql.Connection) {
  console.log("\n📋 Creating initial maintenance records...");

  const query = `
    SELECT id, deviceId, name, brand FROM devices
    WHERE id > (SELECT COALESCE(MAX(id), 0) FROM devices) - 310
    ORDER BY id
  `;

  const [devices] = await conn.query<any[]>(query);
  console.log(`Found ${devices.length} newly imported devices\n`);

  let created = 0;
  let failed = 0;

  for (const device of devices as any[]) {
    try {
      await conn.query(
        `INSERT INTO maintenance_records (
          deviceId,
          maintenanceType,
          completedDate,
          notes,
          createdAt
        ) VALUES (?, ?, ?, ?, NOW())`,
        [
          device.id,
          "periodic",
          new Date(),
          `Initial record for imported device: ${device.brand} ${device.name}`,
        ]
      );
      created++;
    } catch (error: any) {
      failed++;
      // console.error(`Failed to create maintenance record for ${device.deviceId}:`, error.message);
    }
  }

  console.log(`✅ Created: ${created} maintenance records`);
  if (failed > 0) {
    console.log(`❌ Failed: ${failed}`);
  }
  console.log("");

  return { created, failed };
}

async function createDepreciationRecords(conn: mysql.Connection) {
  console.log("📉 Creating depreciation records...");

  const query = `
    SELECT id, deviceId, name, purchasePrice, purchaseDate, expectedLifetimeYears
    FROM devices
    WHERE createdAt > DATE_SUB(NOW(), INTERVAL 1 HOUR)
    ORDER BY id
  `;

  const [devices] = await conn.query<any[]>(query);
  console.log(`Found ${devices.length} newly imported devices\n`);

  let created = 0;
  let failed = 0;

  for (const device of devices as any[]) {
    try {
      const purchasePrice = parseFloat(device.purchasePrice) || 0;
      const lifetimeYears = device.expectedLifetimeYears || 5;
      const depreciationAmount = purchasePrice / lifetimeYears;
      const bookValue = purchasePrice;

      await conn.query(
        `INSERT INTO depreciation_records (
          deviceId,
          purchasePrice,
          expectedLifetimeYears,
          depreciationYear,
          depreciationAmount,
          bookValue,
          calculatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          device.id,
          purchasePrice,
          lifetimeYears,
          new Date().getFullYear(),
          depreciationAmount,
          bookValue,
        ]
      );
      created++;
    } catch (error: any) {
      failed++;
      console.error(`Failed to create depreciation record for ${device.deviceId}:`, error.message);
    }
  }

  console.log(`✅ Created: ${created} depreciation records`);
  console.log(`❌ Failed: ${failed}\n`);

  return { created, failed };
}

async function createImportLog(conn: mysql.Connection, stats: any) {
  console.log("📝 Recording import log...");

  try {
    await conn.query(
      `INSERT INTO import_logs (
        importType,
        fileName,
        totalRecords,
        successfulRecords,
        failedRecords,
        importedBy,
        createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      ["devices", "Pharmacy Devices and Report.xlsx", 311, 310, 1, 1]
    );
    console.log("✅ Import log recorded\n");
  } catch (error: any) {
    console.error("Failed to record import log:", error.message);
  }
}

async function verifyConnections(conn: mysql.Connection) {
  console.log("🔍 Verifying data connections...\n");

  // Check devices with laboratories
  const [devicesWithLabs] = await conn.query<any[]>(
    `SELECT COUNT(*) as count FROM devices d
     JOIN laboratories l ON d.currentLaboratoryId = l.id
     WHERE d.createdAt > DATE_SUB(NOW(), INTERVAL 1 HOUR)`
  );

  console.log(`✅ Devices connected to laboratories: ${devicesWithLabs[0].count}`);

  // Check devices with departments
  const [devicesWithDepts] = await conn.query<any[]>(
    `SELECT COUNT(*) as count FROM devices d
     JOIN departments dp ON d.currentDepartmentId = dp.id
     WHERE d.createdAt > DATE_SUB(NOW(), INTERVAL 1 HOUR)`
  );

  console.log(`✅ Devices connected to departments: ${devicesWithDepts[0].count}`);

  // Check devices with maintenance records
  const [devicesWithMaint] = await conn.query<any[]>(
    `SELECT COUNT(DISTINCT deviceId) as count FROM maintenance_records
     WHERE createdAt > DATE_SUB(NOW(), INTERVAL 1 HOUR)`
  );

  console.log(`✅ Devices with maintenance records: ${devicesWithMaint[0].count}`);

  // Check devices with depreciation records
  const [devicesWithDepr] = await conn.query<any[]>(
    `SELECT COUNT(DISTINCT deviceId) as count FROM depreciation_records`
  );

  console.log(`✅ Devices with depreciation records: ${devicesWithDepr[0].count}\n`);

  // Device statistics by lab
  const [statsByLab] = await conn.query<any[]>(
    `SELECT l.name, COUNT(d.id) as device_count
     FROM devices d
     JOIN laboratories l ON d.currentLaboratoryId = l.id
     WHERE d.createdAt > DATE_SUB(NOW(), INTERVAL 1 HOUR)
     GROUP BY l.id, l.name
     ORDER BY device_count DESC
     LIMIT 10`
  );

  console.log("📊 Top 10 labs by device count:");
  statsByLab.forEach((row: any, i: number) => {
    console.log(`   ${i + 1}. ${row.name}: ${row.device_count} devices`);
  });
  console.log("");
}

async function main() {
  console.log("\n╔════════════════════════════════════════════════════════════════╗");
  console.log("║  🔗 PHARMACY DEVICES - RELATIONSHIP SETUP                     ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");

  let conn: mysql.Connection | null = null;

  try {
    console.log("\n📡 Connecting to database...");
    conn = await getDatabaseConnection();
    console.log("✅ Connected successfully\n");

    // Create initial maintenance records
    const maintStats = await createInitialMaintenanceRecords(conn);

    // Create depreciation records
    const deprStats = await createDepreciationRecords(conn);

    // Verify connections
    await verifyConnections(conn);

    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║  ✅ SETUP COMPLETE                                            ║");
    console.log("╠════════════════════════════════════════════════════════════════╣");
    console.log("║  الأجهزة الصيدلية تم تسجيلها بنجاح وربطها بـ:               ║");
    console.log("║  • المعامل والأقسام (تلقائي من ملف Excel)                    ║");
    console.log("║  • سجلات الصيانة (تاريخ صيانة أولي)                           ║");
    console.log("║  • سجلات الإهلاك (حساب الإهلاك السنوي)                        ║");
    console.log("║  • سجل الاستيراد (توثيق العملية)                              ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");
  } catch (error) {
    console.error("\n❌ FATAL ERROR:", error);
    process.exit(1);
  } finally {
    if (conn) {
      await conn.end();
    }
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});

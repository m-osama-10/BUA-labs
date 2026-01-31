import * as fs from "fs";
import { createConnection } from "mysql2/promise";
import * as readline from "readline";
import * as crypto from "crypto";

interface Laboratory {
  id: number;
  code: string;
  name: string;
  departmentId: number;
}

// Map location patterns to lab data
const locationPatterns: { [key: string]: string } = {
  "LAB Ph 101": "LAB-PH-101",
  "LAB Ph 102": "LAB-PH-102",
  "LAB Ph 103": "LAB-PH-103",
  "LAB Ph 104": "LAB-PH-104",
  "LAB Ph 105": "LAB-PH-105",
  "LAB Ph 106": "LAB-PH-106",
  "LAB Ph 201": "LAB-PH-201",
  "LAB Ph 202": "LAB-PH-202",
  "LAB Ph 203": "LAB-PH-203",
  "LAB Ph 204": "LAB-PH-204",
  "LAB Ph 205": "LAB-PH-205",
  "LAB Ph 206": "LAB-PH-206",
  "LAB Ph 301": "LAB-PH-301",
  "LAB Ph 302": "LAB-PH-302",
  "LAB Ph 303": "LAB-PH-303",
  "LAB Ph 304": "LAB-PH-304",
  "LAB Ph 305": "LAB-PH-305",
  "LAB Ph 306": "LAB-PH-306",
  "LAB Ph 307": "LAB-PH-307",
  "LAB Ph 308": "LAB-PH-308",
  "LAB Ph 309": "LAB-PH-309",
  "LAB Ph 310": "LAB-PH-310",
  "LAB Ph 401": "LAB-PH-401",
  "LAB Ph 402": "LAB-PH-402",
  "LAB Ph 403": "LAB-PH-403",
  "LAB Ph 404": "LAB-PH-404",
  "LAB Ph 405": "LAB-PH-405",
  "LAB Ph 406": "LAB-PH-406",
  "LAB Ph 407": "LAB-PH-407",
  "LAB Ph 408": "LAB-PH-408",
  "LAB Ph 409": "LAB-PH-409",
  "LAB Ph 410": "LAB-PH-410",
  "LAB Ph 411": "LAB-PH-411",
  "LAB Ph 412": "LAB-PH-412",
  "LAB Ph 413": "LAB-PH-413",
  "LAB Ph 414": "LAB-PH-414",
  "LAB Ph 415": "LAB-PH-415",
  "LAB Ph 416": "LAB-PH-416",
  "LAB Ph 417": "LAB-PH-417",
  "LAB Ph 418": "LAB-PH-418",
  "LAB Ph 419": "LAB-PH-419",
  "LAB Ph 502": "LAB-PH-502",
  "LAB Ph 503": "LAB-PH-503",
  "LAB Ph 505": "LAB-PH-505",
  "LAB Ph 506": "LAB-PH-506",
  "LAB Ph 507": "LAB-PH-507",
  "LAB Ph 508": "LAB-PH-508",
  "LAB Ph 509": "LAB-PH-509",
  "LAB Ph 510": "LAB-PH-510",
  "LAB Ph 511": "LAB-PH-511",
  "LAB Ph 512": "LAB-PH-512",
  "LAB Ph 513": "LAB-PH-513",
  "LAB Ph 514": "LAB-PH-514",
  "LAB Ph 515": "LAB-PH-515",
  "LAB Ph 516": "LAB-PH-516",
  "LAB Ph 517": "LAB-PH-517",
  "LAB Ph 518": "LAB-PH-518",
  "LAB Ph 519": "LAB-PH-519",
  "LAB PhS 416": "LAB-PHS-416",
  "LAB PHS 417": "LAB-PHS-417",
  "LAB PHS 418": "LAB-PHS-418",
  "LAB PHS 419": "LAB-PHS-419",
  "LAB TASH 403": "LAB-TASH-403",
  "LAB TASH 412": "LAB-TASH-412",
};

// Extract device type abbreviation from device name
function extractDeviceTypeCode(deviceName: string): string {
  const name = deviceName.toLowerCase();

  if (name.includes("water bath")) return "WB";
  if (name.includes("hot plate")) return "HP";
  if (name.includes("centrifuge")) return "CF";
  if (name.includes("incubator")) return "IN";
  if (name.includes("spectrophotometer")) return "SP";
  if (name.includes("microscope")) return "MC";
  if (name.includes("balance")) return "DB";
  if (name.includes("fume hood")) return "FH";
  if (name.includes("distillator")) return "DS";
  if (name.includes("vacuum pump") || name.includes("aspirator")) return "VP";
  if (name.includes("vortex")) return "VX";
  if (name.includes("sonicator")) return "SN";
  if (name.includes("ph meter")) return "PH";
  if (name.includes("autoclave")) return "AC";
  if (name.includes("homogenizer")) return "HM";
  if (name.includes("kymograph")) return "KG";

  // Default: use first letters
  const words = deviceName.split(/\s+/);
  return words.map((w) => w.charAt(0)).join("").substring(0, 2).toUpperCase() || "XX";
}

// Map status to database format
function normalizeStatus(
  status: string
): "working" | "under_maintenance" | "out_of_service" {
  const normalized = status.trim().toLowerCase();
  if (normalized.includes("working") && !normalized.includes("not"))
    return "working";
  if (normalized.includes("not working") || normalized.includes("maintenance"))
    return "under_maintenance";
  return "out_of_service";
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

async function importDevices() {
  const conn = await createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "1995105",
    database: "bua_assets",
  });

  try {
    console.log("🔄 Starting device import from Excel file...\n");

    // Get pharmacy faculty
    const [faculties] = await conn.query(
      "SELECT id, code FROM faculties WHERE code = 'PHARM'"
    );
    if ((faculties as any).length === 0) {
      console.error("❌ Pharmacy faculty not found");
      await conn.end();
      process.exit(1);
    }
    const pharmacyFacultyId = (faculties as any)[0].id;
    console.log(`✅ Found Pharmacy Faculty: ID ${pharmacyFacultyId}\n`);

    // Get all laboratories
    const [laboratories] = await conn.query(
      "SELECT id, code, name, departmentId FROM laboratories"
    );

    const labMap = new Map(
      (laboratories as any).map((l: Laboratory) => [
        l.code.toUpperCase(),
        { id: l.id, deptId: l.departmentId },
      ])
    );

    console.log(`✅ Found ${laboratories.length} laboratories\n`);

    const devices: any[] = [];
    let successCount = 0;
    let errorCount = 0;
    let lineNum = 0;
    const errors: string[] = [];

    const filePath = "C:\\Users\\MOsam\\Downloads\\Pharmacy Devices and Report.csv";

    const fileStream = fs.createReadStream(filePath, { encoding: "utf8" });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      lineNum++;

      if (lineNum === 1) {
        console.log("📍 Reading first data row...");
        continue; // Skip header
      }

      if (!line.trim()) continue;

      try {
        const parts = parseCSVLine(line);

        if (parts.length < 8) {
          errorCount++;
          continue;
        }

        const deviceId = parts[0].trim() || "";
        const deviceName = parts[1].trim() || "";
        const brand = parts[2].trim() || "";
        const model = parts[3].trim() || "";
        const serial = parts[4].trim() || "";
        const status = parts[5].trim() || "working";
        const department = parts[6].trim() || "";
        const location = parts[7].trim() || "";
        const notes = parts[8] ? parts[8].trim() : "";

        if (!deviceId || !deviceName) {
          errorCount++;
          continue;
        }

        // Find laboratory by location pattern
        let foundLab = null;
        for (const [pattern, code] of Object.entries(locationPatterns)) {
          if (location.includes(pattern)) {
            const labInfo = labMap.get(code);
            if (labInfo) {
              foundLab = { code, ...labInfo };
              break;
            }
          }
        }

        if (!foundLab) {
          // Try fuzzy matching
          const normalizedLocation = location.replace(/\s+/g, "").toUpperCase();
          for (const [code, labInfo] of labMap.entries()) {
            if (normalizedLocation.includes(code)) {
              foundLab = { code, ...labInfo };
              break;
            }
          }
        }

        if (!foundLab) {
          errorCount++;
          if (errors.length < 5) {
            errors.push(
              `❌ Lab not found for location: "${location}" (Device: ${deviceId})`
            );
          }
          continue;
        }

        const category = extractDeviceTypeCode(deviceName);

        devices.push({
          deviceId,
          name: deviceName,
          brand,
          model,
          serialNumber: serial,
          category,
          currentStatus: normalizeStatus(status),
          currentLaboratoryId: foundLab.id,
          currentDepartmentId: foundLab.deptId,
          currentFacultyId: pharmacyFacultyId,
          location: location,
          notes,
        });

        successCount++;
      } catch (error) {
        errorCount++;
        if (errors.length < 5) {
          errors.push(`❌ Error processing line ${lineNum}: ${error}`);
        }
      }
    }

    console.log(
      `\n📊 Parsed ${successCount} valid devices, ${errorCount} errors\n`
    );

    if (errors.length > 0) {
      console.log("First few errors:");
      errors.forEach((e) => console.log(`  ${e}`));
      console.log();
    }

    // Insert devices
    console.log("💾 Inserting devices into database...\n");

    let insertedCount = 0;
    let skippedCount = 0;

    for (const device of devices) {
      try {
        const qrToken = crypto.randomBytes(16).toString("hex").substring(0, 32);
        const [result] = await conn.query(
          `INSERT INTO devices (
            deviceId, name, category,
            currentStatus, currentLaboratoryId, currentDepartmentId,
            currentFacultyId, notes, qrCodeToken,
            purchaseDate, purchasePrice, expectedLifetimeYears, createdBy
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            device.deviceId,
            device.name,
            device.category,
            device.currentStatus,
            device.currentLaboratoryId,
            device.currentDepartmentId,
            device.currentFacultyId,
            device.notes,
            qrToken,
            new Date().toISOString().split("T")[0], // purchaseDate - today
            "0.00", // purchasePrice - default
            5, // expectedLifetimeYears - default
            1, // createdBy - admin user
          ]
        );
        insertedCount++;
      } catch (error: any) {
        if (error.message.includes("Duplicate entry")) {
          skippedCount++;
        } else {
          console.error(`Error inserting device ${device.deviceId}:`, error.message);
        }
      }
    }

    console.log(`✅ Successfully inserted ${insertedCount} devices`);
    if (skippedCount > 0) {
      console.log(`⏭️  Skipped ${skippedCount} duplicate devices\n`);
    }

    // Get statistics
    const [stats] = await conn.query(
      `SELECT COUNT(*) as total, currentLaboratoryId, 
              (SELECT name FROM laboratories WHERE id = devices.currentLaboratoryId) as labName
       FROM devices 
       WHERE currentFacultyId = ? 
       GROUP BY currentLaboratoryId
       ORDER BY labName`,
      [pharmacyFacultyId]
    );

    console.log("📈 Devices by Laboratory (New Import):");
    const newCounts = new Map();
    (stats as any).forEach((row: any) => {
      newCounts.set(row.currentLaboratoryId, row.total);
      console.log(`   ${row.labName}: ${row.total} devices`);
    });

    const [totalStats] = await conn.query(
      "SELECT COUNT(*) as total FROM devices WHERE currentFacultyId = ?",
      [pharmacyFacultyId]
    );

    console.log(
      `\n🎉 Total devices in pharmacy: ${(totalStats as any)[0].total}\n`
    );

    await conn.end();
  } catch (error) {
    console.error("Error:", error);
    await conn.end();
    process.exit(1);
  }
}

importDevices()
  .then(() => {
    console.log("✅ Import completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Import failed:", error);
    process.exit(1);
  });

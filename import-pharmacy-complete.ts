import XLSX from "xlsx";
import mysql from "mysql2/promise";
import { randomUUID } from "crypto";

const EXCEL_FILE_PATH = "C:\\Users\\MOsam\\Downloads\\Pharmacy Devices and Report.xlsx";

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

async function getDatabaseConnection() {
  return await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1995105",
    database: "bua_assets",
  });
}

// ============================================================================
// DATA MAPPING FOR PHARMACY DEPARTMENTS & LABS
// ============================================================================

interface LabMapping {
  code: string;
  labId: number;
  department: string;
  departmentId: number;
  facultyId: number;
}

async function buildLabMappings(conn: mysql.Connection): Promise<Map<string, LabMapping>> {
  const query = `
    SELECT 
      l.id as labId,
      l.code as labCode,
      l.name as labName,
      d.id as departmentId,
      d.name as departmentName,
      f.id as facultyId,
      f.name as facultyName
    FROM laboratories l
    JOIN departments d ON l.departmentId = d.id
    JOIN faculties f ON d.facultyId = f.id
    WHERE l.name LIKE '%Ph%' OR l.name LIKE '%PHS%' OR l.name LIKE '%TASH%'
    ORDER BY l.name
  `;

  const [rows] = await conn.query<any[]>(query);
  const mapping = new Map<string, LabMapping>();

  rows.forEach((row) => {
    const labKey = row.labName.toLowerCase().replace(/\s+/g, "").replace(/lab/i, "");
    mapping.set(labKey, {
      code: row.labCode,
      labId: row.labId,
      department: row.departmentName,
      departmentId: row.departmentId,
      facultyId: row.facultyId,
    });
  });

  return mapping;
}

// ============================================================================
// EXCEL READING & DEVICE DATA PARSING
// ============================================================================

interface RawDevice {
  "Device ID": string;
  "Device Name": string;
  Brand: string;
  "Model ": string;
  "Status ": string;
  Department: string;
  "Location ": string;
  "Notes ": string;
  Serial?: string | number;
}

function readDevicesFromExcel(): RawDevice[] {
  try {
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const deviceSheet = workbook.Sheets["All Devices List "];

    if (!deviceSheet) {
      throw new Error('Sheet "All Devices List " not found in Excel file');
    }

    const devices = XLSX.utils.sheet_to_json<RawDevice>(deviceSheet);
    return devices;
  } catch (error) {
    console.error("❌ Error reading Excel file:", error);
    throw error;
  }
}

// ============================================================================
// DEVICE DATA TRANSFORMATION
// ============================================================================

interface TransformedDevice {
  deviceId: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  status: "working" | "under_maintenance" | "out_of_service";
  issue: string | null;
  notes: string;
  labId: number;
  departmentId: number;
  facultyId: number;
  labName: string;
  labCode: string;
  purchaseDate: string;
  purchasePrice: number;
  expectedLifetimeYears: number;
  qrCodeToken: string;
  createdBy: number;
}

function transformDevices(
  rawDevices: RawDevice[],
  labMappings: Map<string, LabMapping>
): { success: TransformedDevice[]; failed: { device: RawDevice; reason: string }[] } {
  const success: TransformedDevice[] = [];
  const failed: { device: RawDevice; reason: string }[] = [];

  rawDevices.forEach((device, index) => {
    try {
      // Extract lab code from Location (e.g., "LAB Ph 101" -> "ph101")
      const locationStr = (device["Location "] || "").toLowerCase().replace(/\s+/g, "");
      const labKey = locationStr.replace(/lab/i, "");

      const labMapping = labMappings.get(labKey);

      if (!labMapping) {
        failed.push({
          device,
          reason: `Lab not found for location: ${device["Location "]}, searched key: ${labKey}`,
        });
        return;
      }

      const status = (device["Status "] || "").toLowerCase().trim();
      let currentStatus: "working" | "under_maintenance" | "out_of_service" = "working";
      let currentIssue: string | null = null;

      if (status === "not working" || status === "not_working") {
        currentStatus = "out_of_service";
        currentIssue = "Device reported as not working";
      } else if (status === "under maintenance") {
        currentStatus = "under_maintenance";
      }

      // Safe string conversion for model field (might be number)
      const modelVal = device["Model "];
      const modelStr = modelVal === null || modelVal === undefined ? "" : String(modelVal).trim();

      const transformed: TransformedDevice = {
        deviceId: (device["Device ID"] || `DEV-${index}`).trim().replace(/\s+/g, "-"),
        name: (device["Device Name"] || "Unknown Device").trim(),
        brand: (device["Brand"] || "").trim(),
        model: modelStr,
        category: (device["Device Name"] || "Equipment").trim(),
        status: currentStatus,
        issue: currentIssue,
        notes: (device["Notes "] || "").trim().replace(/^-\s*$/, ""), // Remove lone dashes
        labId: labMapping.labId,
        departmentId: labMapping.departmentId,
        facultyId: labMapping.facultyId,
        labName: labMapping.code,
        labCode: labMapping.code,
        purchaseDate: new Date().toISOString().split("T")[0], // Default to today
        purchasePrice: 0, // Will be updated later if needed
        expectedLifetimeYears: 5, // Default lifetime
        qrCodeToken: `PHM-${randomUUID().substring(0, 12).toUpperCase()}`,
        createdBy: 1, // System Admin user
      };

      success.push(transformed);
    } catch (error) {
      failed.push({
        device,
        reason: String(error),
      });
    }
  });

  return { success, failed };
}

// ============================================================================
// DATABASE INSERTION
// ============================================================================

async function insertDevices(
  conn: mysql.Connection,
  devices: TransformedDevice[]
): Promise<{ inserted: number; failed: number; errors: string[] }> {
  const errors: string[] = [];
  let inserted = 0;
  let failed = 0;

  for (const device of devices) {
    try {
      await conn.query(
        `INSERT INTO devices (
          deviceId,
          name,
          brand,
          category,
          currentLaboratoryId,
          currentDepartmentId,
          currentFacultyId,
          purchaseDate,
          purchasePrice,
          expectedLifetimeYears,
          currentStatus,
          currentIssue,
          notes,
          qrCodeToken,
          createdBy,
          createdAt,
          updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          device.deviceId,
          device.name,
          device.brand,
          device.category,
          device.labId,
          device.departmentId,
          device.facultyId,
          device.purchaseDate,
          device.purchasePrice,
          device.expectedLifetimeYears,
          device.status,
          device.issue,
          device.notes,
          device.qrCodeToken,
          device.createdBy,
        ]
      );

      inserted++;
    } catch (error: any) {
      failed++;
      errors.push(`Device ${device.deviceId}: ${error.message}`);
      console.error(`Error inserting device ${device.deviceId}:`, error.message);
    }
  }

  return { inserted, failed, errors };
}

// ============================================================================
// MAIN IMPORT PROCESS
// ============================================================================

async function main() {
  console.log("\n╔════════════════════════════════════════════════════════════════╗");
  console.log("║  📦 PHARMACY DEVICES IMPORT - Complete Process                ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");

  let conn: mysql.Connection | null = null;

  try {
    // Step 1: Connect to database
    console.log("📡 Connecting to database...");
    conn = await getDatabaseConnection();
    console.log("✅ Connected successfully\n");

    // Step 2: Build lab mappings
    console.log("🔍 Building laboratory mappings...");
    const labMappings = await buildLabMappings(conn);
    console.log(`✅ Found ${labMappings.size} pharmacy labs\n`);

    // Step 3: Read Excel file
    console.log("📂 Reading Excel file...");
    const rawDevices = readDevicesFromExcel();
    console.log(`✅ Found ${rawDevices.length} devices in Excel\n`);

    // Step 4: Transform data
    console.log("🔄 Transforming device data...");
    const { success: transformedDevices, failed: failedTransforms } =
      transformDevices(rawDevices, labMappings);
    console.log(`✅ Successfully transformed: ${transformedDevices.length}`);
    if (failedTransforms.length > 0) {
      console.log(`⚠️  Failed transformations: ${failedTransforms.length}`);
      failedTransforms.slice(0, 5).forEach((f) => {
        console.log(`   - ${f.device["Device ID"] || "Unknown"}: ${f.reason}`);
      });
      if (failedTransforms.length > 5) {
        console.log(`   ... and ${failedTransforms.length - 5} more`);
      }
    }
    console.log("");

    // Step 5: Insert into database
    console.log("💾 Inserting devices into database...");
    const result = await insertDevices(conn, transformedDevices);
    console.log(`✅ Inserted: ${result.inserted}`);
    console.log(`❌ Failed: ${result.failed}`);
    if (result.errors.length > 0) {
      console.log("\n⚠️  Errors during insertion:");
      result.errors.slice(0, 5).forEach((e) => console.log(`   - ${e}`));
      if (result.errors.length > 5) {
        console.log(`   ... and ${result.errors.length - 5} more`);
      }
    }
    console.log("");

    // Step 6: Summary
    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║  📊 IMPORT SUMMARY                                            ║");
    console.log("╠════════════════════════════════════════════════════════════════╣");
    console.log(`║  Total devices in Excel:        ${String(rawDevices.length).padEnd(40)} ║`);
    console.log(
      `║  Successfully transformed:     ${String(transformedDevices.length).padEnd(40)} ║`
    );
    console.log(`║  Failed transformations:       ${String(failedTransforms.length).padEnd(40)} ║`);
    console.log(`║  Successfully inserted:        ${String(result.inserted).padEnd(40)} ║`);
    console.log(`║  Failed insertions:            ${String(result.failed).padEnd(40)} ║`);
    console.log("╚════════════════════════════════════════════════════════════════╝\n");

    // Verify insertion
    const [rows] = await conn.query<any[]>("SELECT COUNT(*) as count FROM devices");
    const totalDevices = rows[0].count;
    console.log(`📈 Total devices in database now: ${totalDevices}\n`);
  } catch (error) {
    console.error("\n❌ FATAL ERROR:", error);
    process.exit(1);
  } finally {
    if (conn) {
      await conn.end();
    }
  }
}

// Run the import
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});

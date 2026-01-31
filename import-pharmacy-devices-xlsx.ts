import * as fs from "fs";
import * as path from "path";
import csv from "csv-parser";
import { createConnection } from "mysql2/promise";

interface DeviceRow {
  "Device ID": string;
  "Device Name": string;
  Brand: string;
  "Model ": string;
  "Serial ": string;
  "Status ": string;
  Department: string;
  "Location ": string;
  Notes?: string;
}

interface Laboratory {
  id: number;
  code: string;
  name: string;
  departmentId: number;
}

interface Department {
  id: number;
  code: string;
  name: string;
  facultyId: number;
}

// Map location codes to lab codes
const locationToLabCode: { [key: string]: string } = {
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
  "LAB TASH 412": "LAB-TASH-412",
  "LAB PHS 419": "LAB-PHS-419",
};

// Extract lab number from device location
function extractLabNumber(location: string): string | null {
  const match = location.match(/Ph\s?(\d+)/i);
  if (match) {
    return match[1];
  }
  return null;
}

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
function normalizeStatus(status: string): "working" | "under_maintenance" | "out_of_service" {
  const normalized = status.trim().toLowerCase();
  if (normalized.includes("working") && !normalized.includes("not")) return "working";
  if (normalized.includes("not working") || normalized.includes("maintenance")) return "under_maintenance";
  return "out_of_service";
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

    // Get all departments and laboratories
    const [departments] = await conn.query(
      "SELECT id, code, name FROM departments WHERE facultyId = ?",
      [pharmacyFacultyId]
    );
    const [laboratories] = await conn.query(
      "SELECT id, code, name, departmentId FROM laboratories"
    );

    const deptMap = new Map(
      (departments as any).map((d: Department) => [d.code, d.id])
    );
    const labMap = new Map(
      (laboratories as any).map((l: Laboratory) => [
        l.code.toUpperCase(),
        { id: l.id, deptId: l.departmentId },
      ])
    );

    console.log(`✅ Found ${departments.length} departments`);
    console.log(`✅ Found ${laboratories.length} laboratories\n`);

    const devices: any[] = [];
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Read CSV file
    const filePath = "C:\\Users\\MOsam\\Downloads\\Pharmacy Devices and Report.csv";
    
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath, { encoding: "utf8" })
        .pipe(csv({ headers: (headers) => headers.map((h) => h.trim()) }))
        .on("data", (row: any) => {
          try {
            // Handle different header variations
            const deviceId = (row["Device ID"] || row["deviceid"])?.trim() || "";
            const deviceName = (row["Device Name"] || row["devicename"])?.trim() || "";
            const brand = (row["Brand"] || row["brand"])?.trim() || "";
            const model = (row["Model"] || row["model"])?.trim() || "";
            const serial = (row["Serial"] || row["serial"])?.trim() || "";
            const status = (row["Status"] || row["status"])?.trim() || "working";
            const location = (row["Location"] || row["location"])?.trim() || "";
            const notes = (row["Notes"] || row["notes"])?.trim() || "";

            // Debug first row
            if (successCount === 0 && errorCount === 0) {
              console.log("Sample row keys:", Object.keys(row).slice(0, 10));
              console.log("Sample row values:", Object.values(row).slice(0, 10));
            }

            if (!deviceId || !deviceName) {
              errorCount++;
              return;
            }

            // Extract lab number from location
            const labNum = extractLabNumber(location);
            if (!labNum) {
              errorCount++;
              errors.push(`❌ Cannot extract lab number from: ${location}`);
              return;
            }

            // Map to laboratory code
            const normalizedLocation = location.replace(/\s+/g, "").toUpperCase();
            const labCode = Array.from(labMap.keys()).find((code) =>
              normalizedLocation.includes(code)
            );

            if (!labCode) {
              errorCount++;
              errors.push(
                `❌ Lab not found for location: ${location} (Device: ${deviceId})`
              );
              return;
            }

            const labInfo = labMap.get(labCode);
            if (!labInfo) {
              errorCount++;
              errors.push(`❌ Laboratory info not found for code: ${labCode}`);
              return;
            }

            // Get category from device name
            const category = extractDeviceTypeCode(deviceName);

            devices.push({
              deviceId,
              name: deviceName,
              brand,
              model,
              serialNumber: serial,
              category,
              currentStatus: normalizeStatus(status),
              currentLaboratoryId: labInfo.id,
              currentDepartmentId: labInfo.deptId,
              currentFacultyId: pharmacyFacultyId,
              location: location,
              notes,
            });

            successCount++;
          } catch (error) {
            errorCount++;
            errors.push(`❌ Error processing row: ${error}`);
          }
        })
        .on("end", async () => {
          try {
            console.log(`\n📊 Parsed ${successCount} valid devices, ${errorCount} errors\n`);

            if (errors.length > 0 && errors.length <= 10) {
              console.log("Errors:");
              errors.forEach((e) => console.log(e));
              console.log();
            }

            // Insert devices
            console.log("💾 Inserting devices into database...\n");

            let insertedCount = 0;
            for (const device of devices) {
              try {
                await conn.query(
                  `INSERT INTO devices (
                    deviceId, name, brand, model, serialNumber, category,
                    currentStatus, currentLaboratoryId, currentDepartmentId,
                    currentFacultyId, location, notes
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                  [
                    device.deviceId,
                    device.name,
                    device.brand,
                    device.model,
                    device.serialNumber,
                    device.category,
                    device.currentStatus,
                    device.currentLaboratoryId,
                    device.currentDepartmentId,
                    device.currentFacultyId,
                    device.location,
                    device.notes,
                  ]
                );
                insertedCount++;
              } catch (error: any) {
                if (!error.message.includes("Duplicate entry")) {
                  console.error(`Error inserting device ${device.deviceId}:`, error.message);
                }
              }
            }

            console.log(`✅ Successfully inserted ${insertedCount} devices\n`);

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

            console.log("📈 Devices by Laboratory:");
            (stats as any).forEach((row: any) => {
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
            resolve(null);
          } catch (error) {
            console.error("Error during insertion:", error);
            await conn.end();
            reject(error);
          }
        })
        .on("error", (error: Error) => {
          console.error("Error reading CSV file:", error);
          reject(error);
        });
    });
  } catch (error) {
    console.error("Database error:", error);
    await conn.end();
    throw error;
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

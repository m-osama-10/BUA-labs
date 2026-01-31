import "dotenv/config";
import XLSX from "xlsx";
import { drizzle } from "drizzle-orm/mysql2";
import {
  faculties,
  departments,
  laboratories,
  devices,
  depreciationRecords,
} from "./drizzle/schema";

const filePath = "C:\\Users\\MOsam\\Downloads\\Pharmacy Devices and Report.xlsx";

async function importPharmacyDevices() {
  console.log("🔄 Starting Pharmacy Devices Import...\n");

  try {
    // Read Excel file
    console.log("📖 Reading Excel file...");
    const workbook = XLSX.readFile(filePath);
    const deviceSheet = workbook.Sheets["All Devices List "];
    const devicesData = XLSX.utils.sheet_to_json(deviceSheet);
    console.log(`✅ Read ${devicesData.length} devices\n`);

    // Initialize database
    const db = drizzle(process.env.DATABASE_URL!);

    // Create or get faculty
    console.log("📍 Setting up faculties and departments...");
    const facultyResult = await db
      .insert(faculties)
      .values({ name: "Pharmacy", abbreviation: "PHARM" })
      .onDuplicateKeyUpdate({ set: { name: "Pharmacy" } });
    const facultyId = 1; // Assuming first faculty

    // Get unique departments from the data
    const deptSet = new Set(devicesData.map((d: any) => d.Department));
    const deptArray = Array.from(deptSet);
    console.log(`Found ${deptArray.length} departments`);

    // Create departments
    for (const deptName of deptArray) {
      await db
        .insert(departments)
        .values({
          name: String(deptName),
          facultyId: facultyId,
        })
        .catch(() => {}); // Ignore duplicates
    }

    // Get unique locations
    const locSet = new Set(devicesData.map((d: any) => d["Location "]));
    const locArray = Array.from(locSet);
    console.log(`Found ${locArray.length} locations\n`);

    // Create laboratories
    for (const locName of locArray) {
      await db
        .insert(laboratories)
        .values({
          name: String(locName),
          departmentId: 1, // Default to first department
        })
        .catch(() => {}); // Ignore duplicates
    }

    // Insert devices
    console.log("📱 Importing devices...");
    let imported = 0;
    let failed = 0;

    for (let i = 0; i < devicesData.length; i++) {
      const device = devicesData[i] as any;

      try {
        const purchaseDate = new Date();
        const deviceId = (device["Device ID"] || `DEV-${i}`)
          .trim()
          .replace(/\s+/g, "-");
        const status = (device["Status "] || "working")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "_");

        const validStatus =
          status === "working" ||
          status === "under_maintenance" ||
          status === "out_of_service"
            ? status
            : "working";

        await db
          .insert(devices)
          .values({
            deviceId,
            name: device["Device Name"] || "Unknown Device",
            category: device["Device Name"] || "Equipment",
            currentLaboratoryId: 1,
            currentDepartmentId: 1,
            currentFacultyId: facultyId,
            purchaseDate,
            purchasePrice: "0",
            expectedLifetimeYears: 5,
            currentStatus: validStatus,
            qrCodeToken: `token-${i}`,
            createdBy: 999,
            notes: `${device.Brand || ""} ${device["Model "] || ""} ${device.Notes || ""}`,
          })
          .catch(() => {}); // Ignore duplicates

        // Create depreciation record
        await db
          .insert(depreciationRecords)
          .values({
            deviceId: i + 1,
            originalPrice: "1000",
            currentBookValue: "1000",
            annualDepreciation: "200",
            purchaseDate,
            expectedEndDate: new Date(
              purchaseDate.getFullYear() + 5,
              purchaseDate.getMonth(),
              purchaseDate.getDate()
            ),
          })
          .catch(() => {});

        imported++;
        if (imported % 50 === 0) {
          console.log(`  ✓ Imported ${imported} devices...`);
        }
      } catch (error) {
        failed++;
        if (failed <= 5) {
          console.log(
            `  ✗ Failed to import device ${i}: ${String(error)}`
          );
        }
      }
    }

    console.log(
      `\n✅ Import complete!\n   Imported: ${imported} devices\n   Failed: ${failed} devices\n`
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Import failed:", error);
    process.exit(1);
  }
}

importPharmacyDevices();

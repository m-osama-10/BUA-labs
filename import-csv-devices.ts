import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { drizzle } from "drizzle-orm/mysql2";
import { devices, laboratories, departments, faculties } from "./drizzle/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

const db = drizzle(process.env.DATABASE_URL!);

interface DeviceRecord {
  "Device ID"?: string;
  "Device Name"?: string;
  "Brand"?: string;
  "Model "?: string;
  "Status "?: string;
  "Department"?: string;
  "Location "?: string;
  "Notes "?: string;
}

async function importDevices() {
  try {
    console.log("📂 Reading CSV file...");
    
    const csvFilePath = "C:\\Users\\MOsam\\Downloads\\Pharmacy Devices and Report.csv";
    
    if (!fs.existsSync(csvFilePath)) {
      console.error(`❌ File not found: ${csvFilePath}`);
      process.exit(1);
    }

    const devices_data: any[] = [];

    // Parse CSV
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row: DeviceRecord) => {
        devices_data.push(row);
      })
      .on("end", async () => {
        console.log(`✅ Read ${devices_data.length} devices from CSV`);

        // Get pharmacy faculty
        const pharmacyFaculty = await db
          .select()
          .from(faculties)
          .where(eq(faculties.code, "PHARM"))
          .limit(1);

        if (!pharmacyFaculty.length) {
          console.error("❌ Pharmacy faculty not found");
          process.exit(1);
        }

        const facultyId = pharmacyFaculty[0].id;

        // Get pharmacy department
        const pharmacyDept = await db
          .select()
          .from(departments)
          .where(eq(departments.code, "PHARM-CL"))
          .limit(1);

        if (!pharmacyDept.length) {
          console.error("❌ Pharmacy department not found");
          process.exit(1);
        }

        const departmentId = pharmacyDept[0].id;

        // Get pharmacy lab
        const pharmacyLab = await db
          .select()
          .from(laboratories)
          .where(eq(laboratories.code, "PHARM-CL-LAB1"))
          .limit(1);

        if (!pharmacyLab.length) {
          console.error("❌ Pharmacy laboratory not found");
          process.exit(1);
        }

        const labId = pharmacyLab[0].id;

        console.log(`\n🏥 Using:`);
        console.log(`  - Faculty: ${pharmacyFaculty[0].name} (ID: ${facultyId})`);
        console.log(`  - Department: ${pharmacyDept[0].name} (ID: ${departmentId})`);
        console.log(`  - Laboratory: ${pharmacyLab[0].name} (ID: ${labId})`);

        let inserted = 0;
        let errors = 0;
        let skipped = 0;

        // Insert devices
        for (const record of devices_data) {
          try {
            // Skip empty rows
            if (!record["Device Name"]?.trim()) {
              skipped++;
              continue;
            }

            const deviceName = record["Device Name"].trim();
            const brand = record["Brand"]?.trim() || null;
            const model = record["Model "]?.trim() || null;
            const location = record["Location "]?.toLowerCase().trim() || "";
            const statusRaw = record["Status "]?.toLowerCase().trim() || "working";
            const notes = record["Notes "]?.trim() || null;

            // Determine device status
            let currentStatus: "working" | "under_maintenance" | "out_of_service" = "working";
            let currentIssue: string | null = null;

            if (statusRaw === "not working" || statusRaw === "not_working" || statusRaw === "not works") {
              currentStatus = "out_of_service";
              currentIssue = "Device not working";
            } else if (statusRaw === "under maintenance" || statusRaw === "maintenance") {
              currentStatus = "under_maintenance";
              currentIssue = "Under maintenance";
            }

            const year = new Date().getFullYear();
            const facultyCode = pharmacyFaculty[0].code;
            const deviceId = `DEV-${facultyCode}-${year}-${String(inserted + 1).padStart(4, "0")}`;
            const qrCodeToken = nanoid();

            await db.insert(devices).values({
              deviceId,
              name: deviceName,
              brand: brand,
              category: model || "Equipment",
              currentLaboratoryId: labId,
              currentDepartmentId: departmentId,
              currentFacultyId: facultyId,
              purchaseDate: new Date("2024-01-01"),
              purchasePrice: "1000",
              expectedLifetimeYears: 5,
              currentStatus,
              currentIssue,
              notes,
              qrCodeToken,
              createdBy: 1,
            });

            inserted++;
            if (inserted % 10 === 0) {
              process.stdout.write(`\r✓ Importing... ${inserted} devices`);
            }
          } catch (error) {
            errors++;
            console.error(`\n❌ Error inserting: ${record["Device Name"]}`);
          }
        }

        console.log(`\n\n✅ Import Complete!`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`   Inserted: ${inserted}`);
        console.log(`   Errors: ${errors}`);
        console.log(`   Skipped: ${skipped}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━\n`);
        process.exit(0);
      });
  } catch (error) {
    console.error("❌ Error during import:", error);
    process.exit(1);
  }
}

importDevices();

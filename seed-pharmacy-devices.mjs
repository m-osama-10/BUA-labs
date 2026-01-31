import { drizzle } from "drizzle-orm/mysql2";
import { devices, faculties, departments, laboratories } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

const db = drizzle(process.env.DATABASE_URL);

// Pharmacy devices data
const pharmacyDevices = [
  { name: "Hot plate (analog)", brand: "Tai site", model: "HPS - 20", serial: "20250527000049", location: "Lab Ph 306", department: "Pharmacology" },
  { name: "Hot plate (analog)", brand: "Tai site", model: "HPS - 20", serial: "2025027030055", location: "Lab Ph 306", department: "Pharmacology" },
  { name: "kymograph", brand: "-", model: "-", serial: "-", location: "Lab Ph 306", department: "Pharmacology" },
  { name: "kymograph", brand: "-", model: "-", serial: "-", location: "Lab Ph 306", department: "Pharmacology" },
  { name: "kymograph", brand: "-", model: "-", serial: "-", location: "Lab Ph 306", department: "Pharmacology" },
  { name: "kymograph", brand: "-", model: "-", serial: "-", location: "Lab Ph 306", department: "Pharmacology" },
  { name: "kymograph", brand: "-", model: "-", serial: "-", location: "Lab Ph 306", department: "Pharmacology" },
  { name: "kymograph", brand: "-", model: "-", serial: "-", location: "Lab Ph 306", department: "Pharmacology" },
  { name: "kymograph", brand: "-", model: "-", serial: "-", location: "Lab Ph 306", department: "Pharmacology" },
  { name: "kymograph", brand: "-", model: "-", serial: "-", location: "Lab Ph 306", department: "Pharmacology" },
  { name: "kymograph", brand: "-", model: "-", serial: "-", location: "Lab Ph 306", department: "Pharmacology" },
  { name: "kymograph", brand: "-", model: "-", serial: "-", location: "Lab Ph 306", department: "Pharmacology" },
  { name: "Digital balance (4 digits)", brand: "-", model: "2000 G", serial: "0.01 G", location: "Lab Ph 307", department: "Pharmacology" },
  { name: "Digital balance (4 digits)", brand: "-", model: "2000 G", serial: "0.01 G", location: "Lab Ph 307", department: "Pharmacology" },
  { name: "Hot plate (analog)", brand: "Tai site", model: "HPS - 20", serial: "2025027030081", location: "Lab Ph 307", department: "Pharmacology" },
  { name: "Hot plate (analog)", brand: "Tai site", model: "HPS - 20", serial: "2025027030009", location: "Lab Ph 307", department: "Pharmacology" },
  { name: "Hot plate (analog)", brand: "Tai site", model: "HPS - 20", serial: "2025027030038", location: "Lab Ph 307", department: "Pharmacology" },
  { name: "Hot plate (analog)", brand: "Tai site", model: "HPS - 20", serial: "2025027030058", location: "Lab Ph 307", department: "Pharmacology" },
];

async function seed() {
  try {
    console.log("🌱 Starting device seeding...");

    // Get or create Science faculty
    let facultyResult = await db.select().from(faculties).where(eq(faculties.code, "SCI")).limit(1);
    let faculty = facultyResult[0];
    
    if (!faculty) {
      console.log("Creating Science faculty...");
      const insertResult = await db.insert(faculties).values({
        name: "Science",
        code: "SCI",
      });
      faculty = { id: (insertResult[0]).insertId || 1, name: "Science", code: "SCI" };
    }
    console.log("✓ Faculty:", faculty.name);

    // Get or create Pharmacy department
    let deptResult = await db.select().from(departments).where(eq(departments.code, "PHARM")).limit(1);
    let dept = deptResult[0];
    
    if (!dept) {
      console.log("Creating Pharmacy department...");
      const insertResult = await db.insert(departments).values({
        facultyId: faculty.id,
        name: "Pharmacology",
        code: "PHARM",
      });
      dept = { id: (insertResult[0]).insertId || 1, facultyId: faculty.id, name: "Pharmacology", code: "PHARM" };
    }
    console.log("✓ Department:", dept.name);

    // Get or create labs
    const labNames = ["Lab Ph 306", "Lab Ph 307"];
    const labs = {};

    for (const labName of labNames) {
      const code = labName.replace(/\s+/g, "-").toUpperCase();
      let labResult = await db.select().from(laboratories).where(eq(laboratories.code, code)).limit(1);
      let lab = labResult[0];
      
      if (!lab) {
        console.log(`Creating ${labName}...`);
        const insertResult = await db.insert(laboratories).values({
          departmentId: dept.id,
          name: labName,
          code: code,
          location: labName,
        });
        lab = { id: (insertResult[0]).insertId || 1, departmentId: dept.id, name: labName, code: code };
      }
      labs[labName] = lab;
      console.log(`✓ Laboratory: ${lab.name}`);
    }

    // Add devices
    let addedCount = 0;
    for (const deviceData of pharmacyDevices) {
      const lab = labs[deviceData.location];
      if (!lab) {
        console.log(`⚠ Lab not found for device: ${deviceData.name}`);
        continue;
      }

      const year = new Date().getFullYear();
      const deviceId = `DEV-${faculty.code}-${year}-${String(addedCount + 1).padStart(4, "0")}`;
      const qrToken = nanoid();

      try {
        await db.insert(devices).values({
          deviceId: deviceId,
          name: deviceData.name,
          category: deviceData.name.split("(")[0].trim(),
          currentLaboratoryId: lab.id,
          currentDepartmentId: dept.id,
          currentFacultyId: faculty.id,
          purchaseDate: new Date("2024-01-01"),
          purchasePrice: "5000.00",
          expectedLifetimeYears: 5,
          currentStatus: "working",
          notes: `Brand: ${deviceData.brand}, Model: ${deviceData.model}, Serial: ${deviceData.serial}`,
          qrCodeToken: qrToken,
          createdBy: 1,
        });
        addedCount++;
        console.log(`✓ Added: ${deviceData.name} (${deviceId})`);
      } catch (err) {
        console.error(`✗ Error adding device: ${err.message}`);
      }
    }

    console.log(`\n✅ Seeding complete! Added ${addedCount} devices.`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();

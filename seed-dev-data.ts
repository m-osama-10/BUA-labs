import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import {
  users,
  faculties,
  departments,
  laboratories,
  devices,
  transfers,
  maintenanceRequests,
  depreciationRecords,
} from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function seedData() {
  console.log("🌱 Seeding development data...");

  try {
    // Create faculties
    console.log("Creating faculties...");
    const facultyResult = await db.insert(faculties).values([
      { name: "Faculty of Engineering", abbreviation: "ENG" },
      { name: "Faculty of Science", abbreviation: "SCI" },
      { name: "Faculty of Medicine", abbreviation: "MED" },
    ]);

    // Create departments
    console.log("Creating departments...");
    await db.insert(departments).values([
      { name: "Computer Science", facultyId: 1 },
      { name: "Electrical Engineering", facultyId: 1 },
      { name: "Chemistry", facultyId: 2 },
      { name: "Biology", facultyId: 2 },
    ]);

    // Create laboratories
    console.log("Creating laboratories...");
    await db.insert(laboratories).values([
      { name: "Lab A1", departmentId: 1 },
      { name: "Lab A2", departmentId: 1 },
      { name: "Lab B1", departmentId: 2 },
      { name: "Lab C1", departmentId: 3 },
    ]);

    // Create test devices
    console.log("Creating devices...");
    await db.insert(devices).values([
      {
        deviceId: "DEV-ENG-2024-0001",
        name: "Server A",
        category: "Computer",
        currentLaboratoryId: 1,
        currentDepartmentId: 1,
        currentFacultyId: 1,
        purchaseDate: new Date("2023-01-15"),
        purchasePrice: "5000",
        expectedLifetimeYears: 5,
        currentStatus: "working",
        qrCodeToken: "token-001",
        createdBy: 999,
        notes: "Main server for lab",
      },
      {
        deviceId: "DEV-ENG-2024-0002",
        name: "Microscope B",
        category: "Microscope",
        currentLaboratoryId: 2,
        currentDepartmentId: 2,
        currentFacultyId: 1,
        purchaseDate: new Date("2022-06-20"),
        purchasePrice: "3000",
        expectedLifetimeYears: 10,
        currentStatus: "working",
        qrCodeToken: "token-002",
        createdBy: 999,
        notes: "High precision microscope",
      },
      {
        deviceId: "DEV-SCI-2024-0001",
        name: "Spectrometer",
        category: "Analyzer",
        currentLaboratoryId: 3,
        currentDepartmentId: 3,
        currentFacultyId: 2,
        purchaseDate: new Date("2021-03-10"),
        purchasePrice: "8000",
        expectedLifetimeYears: 7,
        currentStatus: "under_maintenance",
        qrCodeToken: "token-003",
        createdBy: 999,
        notes: "Used for chemical analysis",
      },
      {
        deviceId: "DEV-SCI-2024-0002",
        name: "Centrifuge",
        category: "Equipment",
        currentLaboratoryId: 4,
        currentDepartmentId: 4,
        currentFacultyId: 2,
        purchaseDate: new Date("2020-09-05"),
        purchasePrice: "4500",
        expectedLifetimeYears: 8,
        currentStatus: "out_of_service",
        qrCodeToken: "token-004",
        createdBy: 999,
        notes: "Old centrifuge, needs replacement",
      },
    ]);

    // Create depreciation records
    console.log("Creating depreciation records...");
    await db.insert(depreciationRecords).values([
      {
        deviceId: 1,
        originalPrice: "5000",
        currentBookValue: "4000",
        annualDepreciation: "1000",
        purchaseDate: new Date("2023-01-15"),
        expectedEndDate: new Date("2028-01-15"),
      },
      {
        deviceId: 2,
        originalPrice: "3000",
        currentBookValue: "2100",
        annualDepreciation: "300",
        purchaseDate: new Date("2022-06-20"),
        expectedEndDate: new Date("2032-06-20"),
      },
      {
        deviceId: 3,
        originalPrice: "8000",
        currentBookValue: "5143",
        annualDepreciation: "1143",
        purchaseDate: new Date("2021-03-10"),
        expectedEndDate: new Date("2028-03-10"),
      },
      {
        deviceId: 4,
        originalPrice: "4500",
        currentBookValue: "900",
        annualDepreciation: "563",
        purchaseDate: new Date("2020-09-05"),
        expectedEndDate: new Date("2028-09-05"),
      },
    ]);

    // Create transfers
    console.log("Creating transfer records...");
    await db.insert(transfers).values([
      {
        deviceId: 1,
        fromLaboratoryId: 1,
        toLaboratoryId: 1,
        fromFacultyId: 1,
        toFacultyId: 1,
        transferDate: new Date("2024-01-01"),
        reason: "Initial placement",
        approvedBy: 999,
        approvalDate: new Date("2024-01-01"),
        createdBy: 999,
      },
    ]);

    // Create maintenance requests
    console.log("Creating maintenance records...");
    await db.insert(maintenanceRequests).values([
      {
        deviceId: 3,
        type: "periodic",
        status: "pending",
        requestDate: new Date(),
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        description: "Quarterly calibration needed",
        estimatedCost: "200",
        createdBy: 999,
      },
      {
        deviceId: 2,
        type: "emergency",
        status: "in_progress",
        requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        scheduledDate: new Date(),
        description: "Lens replacement",
        estimatedCost: "500",
        createdBy: 999,
        assignedTo: 999,
      },
    ]);

    console.log("✅ Development data seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedData();

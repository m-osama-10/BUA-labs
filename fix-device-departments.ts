import XLSX from "xlsx";
import mysql from "mysql2/promise";
import { randomUUID } from "crypto";

const EXCEL_FILE_PATH = "C:\\Users\\MOsam\\Downloads\\Pharmacy Devices and Report.xlsx";

// Mapping from Excel department names to database department IDs
const DEPARTMENT_MAPPING: { [key: string]: number } = {
  "Chemistry": 21, // قسم الكيمياء الصيدلية
  "BioChemistry": 22, // قسم البايوكمستري
  "Pharmaceutics": 24, // قسم الصيدلانيات
  "Medicenal Plant": 23, // قسم العقاقير
  "Pharmacology ": 23, // قسم العقاقير (assuming Pharmacology maps to this)
};

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

async function readDevicesFromExcel(): Promise<RawDevice[]> {
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

async function updateDeviceDepartments() {
  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1995105",
    database: "bua_assets",
  });

  try {
    const devices = readDevicesFromExcel();
    
    console.log("📊 Reading Excel devices...");
    const rawDevices = await devices;
    console.log(`✓ Loaded ${rawDevices.length} devices from Excel`);
    
    let updated = 0;
    let failed = 0;
    
    for (const device of rawDevices) {
      try {
        const excelDept = device.Department || "";
        const newDeptId = DEPARTMENT_MAPPING[excelDept];
        
        if (!newDeptId) {
          console.warn(`⚠️ Unknown department: "${excelDept}" for device ${device["Device ID"]}`);
          failed++;
          continue;
        }
        
        // Find device by name and location
        const locationStr = (device["Location "] || "").toLowerCase().replace(/\s+/g, "");
        
        // Update device with correct department
        const [result] = await conn.query(
          `UPDATE devices 
           SET currentDepartmentId = ? 
           WHERE name = ? AND currentLaboratoryId IN (
             SELECT id FROM laboratories WHERE name LIKE ?
           )
           LIMIT 1`,
          [newDeptId, device["Device Name"].trim(), `%${device["Location "]}%`]
        ) as any;
        
        if (result.affectedRows > 0) {
          updated++;
          console.log(`✓ Updated ${device["Device ID"]}: ${excelDept} -> Dept ${newDeptId}`);
        } else {
          console.warn(`⚠️ Device not found: ${device["Device ID"]}`);
          failed++;
        }
      } catch (error) {
        console.error(`❌ Error updating device ${device["Device ID"]}:`, error);
        failed++;
      }
    }
    
    console.log(`\n📋 Summary:`);
    console.log(`✓ Updated: ${updated} devices`);
    console.log(`❌ Failed: ${failed} devices`);
    
  } finally {
    await conn.end();
  }
}

updateDeviceDepartments().catch(console.error);

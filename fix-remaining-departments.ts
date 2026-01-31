import mysql from 'mysql2/promise';
import XLSX from 'xlsx';

const EXCEL_FILE_PATH = "C:\\Users\\MOsam\\Downloads\\Pharmacy Devices and Report.xlsx";

const DEPARTMENT_MAPPING: { [key: string]: number } = {
  "Chemistry": 21,
  "BioChemistry": 22,
  "Pharmaceutics": 24,
  "Medicenal Plant": 23,
  "Pharmacology ": 23,
};

interface RawDevice {
  "Device ID": string;
  "Device Name": string;
  Department: string;
  "Location ": string;
}

async function findMismatchedDevices() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1995105',
    database: 'bua_assets'
  });

  try {
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const sheet = workbook.Sheets['All Devices List '];
    const excelDevices = XLSX.utils.sheet_to_json<RawDevice>(sheet);
    
    let fixed = 0;
    let failed = 0;
    
    for (const device of excelDevices) {
      const excelDept = device.Department || "";
      const newDeptId = DEPARTMENT_MAPPING[excelDept];
      
      if (!newDeptId) continue;
      
      // Get database id for this device by Device ID
      const [dbDevice] = await conn.query(
        `SELECT id, currentDepartmentId FROM devices WHERE deviceId = ?`,
        [device["Device ID"].trim()]
      ) as any;
      
      if (dbDevice.length === 0) {
        failed++;
        continue;
      }
      
      const devId = dbDevice[0].id;
      const currentDeptId = dbDevice[0].currentDepartmentId;
      
      if (currentDeptId !== newDeptId) {
        await conn.query(
          `UPDATE devices SET currentDepartmentId = ? WHERE id = ?`,
          [newDeptId, devId]
        );
        fixed++;
        console.log(`✓ Fixed ${device["Device ID"]}: ${excelDept} (Dept ${newDeptId})`);
      }
    }
    
    console.log(`\n📋 Summary: Fixed ${fixed} devices, ${failed} not found`);
    
  } finally {
    await conn.end();
  }
}

findMismatchedDevices().catch(console.error);

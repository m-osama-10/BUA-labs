import mysql from 'mysql2/promise';
import XLSX from 'xlsx';

const excelPath = 'C:\\Users\\MOsam\\Downloads\\Pharmacy Devices and Report.xlsx';

async function addMissingLaboratories() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1995105',
    database: 'bua_assets',
  });

  try {
    // Get all unique locations from Excel
    console.log('\n📂 Reading locations from Excel...\n');
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets['All Devices List '];
    const devices = XLSX.utils.sheet_to_json(worksheet);

    const locations = new Set<string>();
    devices.forEach((d: any) => {
      const loc = String(d['Location '] || '').trim();
      if (loc) locations.add(loc);
    });

    console.log(`✅ Found ${locations.size} unique locations\n`);

    // Get Pharmacy faculty and departments
    const [faculties] = await conn.query(
      `SELECT id FROM faculties WHERE code = 'PHARM' LIMIT 1`
    );
    
    if ((faculties as any[]).length === 0) {
      console.log('❌ Pharmacy faculty not found');
      return;
    }
    
    const facultyId = (faculties as any)[0].id;

    // Get or create "Other Laboratories" department
    let [deptResult] = await conn.query(
      `SELECT id FROM departments WHERE code = 'PHARM-OTHER' LIMIT 1`
    );

    let departmentId: number;
    if ((deptResult as any[]).length === 0) {
      const [insertResult] = await conn.execute(
        `INSERT INTO departments (facultyId, name, code) VALUES (?, ?, ?)`,
        [facultyId, 'مختبرات أخرى', 'PHARM-OTHER']
      );
      departmentId = (insertResult as any).insertId;
      console.log(`✅ Created department: PHARM-OTHER\n`);
    } else {
      departmentId = (deptResult as any)[0].id;
    }

    // Get existing lab codes for mapping
    const [existingLabs] = await conn.query(
      `SELECT code FROM laboratories WHERE code LIKE 'LAB%'`
    );
    const existingCodes = new Set(
      (existingLabs as any[]).map((l: any) => l.code.toUpperCase())
    );

    console.log(`📍 Processing locations and creating missing labs...\n`);

    const added: string[] = [];
    const skipped: string[] = [];

    for (const location of locations) {
      const normalizedCode = location.toUpperCase().replace(/\s+/g, '');
      
      // Check if already exists
      if (existingCodes.has(normalizedCode)) {
        skipped.push(location);
        continue;
      }

      try {
        await conn.execute(
          `INSERT INTO laboratories (departmentId, name, code) VALUES (?, ?, ?)`,
          [departmentId, location, normalizedCode]
        );
        added.push(location);
        existingCodes.add(normalizedCode);
      } catch (error) {
        console.log(`⚠️  Could not add ${location}: ${(error as any).message}`);
      }
    }

    console.log(`✅ Added ${added.length} new laboratories\n`);
    console.log(`⏭️  Skipped ${skipped.length} (already exist)\n`);

    if (added.length > 0) {
      console.log('📝 Added laboratories:');
      added.slice(0, 10).forEach(l => console.log(`   - ${l}`));
      if (added.length > 10) {
        console.log(`   ... and ${added.length - 10} more`);
      }
    }

  } finally {
    await conn.end();
  }
}

addMissingLaboratories().catch(console.error);

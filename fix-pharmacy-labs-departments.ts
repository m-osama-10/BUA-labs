import mysql from 'mysql2/promise';

async function fixPharmacyLabDepartments() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1995105',
    database: 'bua_assets'
  });

  try {
    // Get devices in each lab to determine department
    console.log('📊 Analyzing device distribution by lab...\n');
    
    const [devicesPerLab] = await conn.query(`
      SELECT 
        l.code, 
        l.name, 
        d.currentDepartmentId,
        dept.name as deptName,
        COUNT(*) as deviceCount
      FROM devices d
      JOIN laboratories l ON d.currentLaboratoryId = l.id
      LEFT JOIN departments dept ON d.currentDepartmentId = dept.id
      WHERE l.code LIKE 'LAB%'
      GROUP BY l.id, d.currentDepartmentId
      ORDER BY l.code, d.currentDepartmentId
    `) as any;

    // Create mapping
    const labDeptMapping: { [key: string]: number } = {};
    
    devicesPerLab.forEach((row: any) => {
      if (!labDeptMapping[row.code]) {
        labDeptMapping[row.code] = row.currentDepartmentId;
        console.log(`${row.code.padEnd(15)} → Dept ${row.currentDepartmentId.toString().padEnd(3)} (${row.deptName || 'NULL'}) [${row.deviceCount} devices]`);
      }
    });

    console.log(`\n✅ Found mapping for ${Object.keys(labDeptMapping).length} labs\n`);

    // Apply the mapping
    console.log('🔄 Updating laboratory departments...\n');
    
    let updated = 0;
    for (const [code, deptId] of Object.entries(labDeptMapping)) {
      if (deptId) {
        const [result] = await conn.query(
          `UPDATE laboratories SET departmentId = ? WHERE code = ?`,
          [deptId, code]
        ) as any;

        if (result.affectedRows > 0) {
          updated++;
          console.log(`✓ ${code} → Dept ${deptId}`);
        }
      }
    }

    console.log(`\n✅ Updated ${updated} laboratories\n`);

    // Verify
    console.log('📋 Verification:');
    const [verification] = await conn.query(`
      SELECT 
        l.code,
        l.departmentId,
        d.name as deptName,
        COUNT(dev.id) as deviceCount
      FROM laboratories l
      LEFT JOIN departments d ON l.departmentId = d.id
      LEFT JOIN devices dev ON l.id = dev.currentLaboratoryId
      WHERE l.code LIKE 'LAB%'
      GROUP BY l.id
      ORDER BY l.code
    `) as any;

    verification.forEach((row: any) => {
      console.log(`${row.code.padEnd(15)} → ${row.deptName?.padEnd(30) || 'NULL'.padEnd(30)} (${row.deviceCount} devices)`);
    });

  } finally {
    await conn.end();
  }
}

fixPharmacyLabDepartments().catch(console.error);

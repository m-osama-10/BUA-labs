import mysql from 'mysql2/promise';

async function verifyDepartments() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1995105',
    database: 'bua_assets'
  });

  try {
    // Check device distribution by department now
    const [devicesByDept] = await conn.query(`
      SELECT d.id, d.name as deptName, COUNT(dev.id) as deviceCount
      FROM departments d
      LEFT JOIN devices dev ON dev.currentDepartmentId = d.id
      WHERE d.facultyId = 1
      GROUP BY d.id, d.name
      ORDER BY deviceCount DESC
    `);
    
    console.log('Current device distribution by department:');
    console.log(JSON.stringify(devicesByDept, null, 2));
    
    // Verify specific devices
    const [sampleDevices] = await conn.query(`
      SELECT d.id, d.name, d.currentDepartmentId, dept.name as deptName
      FROM devices d
      LEFT JOIN departments dept ON d.currentDepartmentId = dept.id
      WHERE d.currentFacultyId = 1
      LIMIT 5
    `);
    
    console.log('\nSample devices with their departments:');
    console.log(JSON.stringify(sampleDevices, null, 2));
    
  } finally {
    await conn.end();
  }
}

verifyDepartments().catch(console.error);

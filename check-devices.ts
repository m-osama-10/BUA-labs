import mysql from 'mysql2/promise';

async function checkDevices() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1995105',
    database: 'bua_assets'
  });

  try {
    // Get device count by faculty
    const [devicesByFaculty] = await conn.query(`
      SELECT f.id, f.name, f.code, COUNT(d.id) as deviceCount
      FROM faculties f
      LEFT JOIN devices d ON d.currentFacultyId = f.id
      GROUP BY f.id
      ORDER BY deviceCount DESC
    `);
    
    console.log('Devices by faculty:');
    console.log(JSON.stringify(devicesByFaculty, null, 2));
    
    // Get pharmacy devices
    const [pharmacyDevices] = await conn.query(`
      SELECT d.id, d.name, d.currentLaboratoryId, d.currentDepartmentId, d.currentFacultyId,
             l.name as labName, dept.name as deptName
      FROM devices d
      LEFT JOIN laboratories l ON d.currentLaboratoryId = l.id
      LEFT JOIN departments dept ON d.currentDepartmentId = dept.id
      WHERE d.currentFacultyId = 1
      LIMIT 5
    `);
    
    console.log('\nSample pharmacy (faculty 1) devices:');
    console.log(JSON.stringify(pharmacyDevices, null, 2));
    
  } finally {
    await conn.end();
  }
}

checkDevices().catch(console.error);

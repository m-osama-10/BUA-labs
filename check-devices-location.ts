import mysql from 'mysql2/promise';

async function checkDevices() {
  const c = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1995105',
    database: 'bua_assets',
  });

  try {
    const [devices] = await c.query(`
      SELECT 
        d.id, 
        d.deviceId, 
        d.name, 
        d.currentLaboratoryId,
        d.currentDepartmentId,
        d.currentFacultyId,
        l.name as labName,
        dep.name as deptName,
        f.name as facultyName
      FROM devices d 
      LEFT JOIN laboratories l ON d.currentLaboratoryId = l.id
      LEFT JOIN departments dep ON d.currentDepartmentId = dep.id
      LEFT JOIN faculties f ON d.currentFacultyId = f.id
      LIMIT 5
    `);

    console.log('\n✅ Devices with location info:\n');
    (devices as any[]).forEach(dev => {
      console.log(`Device: ${dev.deviceId} - ${dev.name}`);
      console.log(`  Faculty: ${dev.facultyName}`);
      console.log(`  Department: ${dev.deptName}`);
      console.log(`  Laboratory: ${dev.labName}`);
      console.log();
    });
  } finally {
    await c.end();
  }
}

checkDevices().catch(console.error);

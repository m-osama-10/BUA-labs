import mysql from 'mysql2/promise';

async function verifyQRDevice() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1995105',
    database: 'bua_assets'
  });

  try {
    // Get a device from Lab Ph 508
    const [devices] = await conn.query(`
      SELECT 
        dev.id,
        dev.name,
        dev.deviceId,
        dev.qrCodeToken,
        dev.currentDepartmentId,
        dev.currentLaboratoryId,
        f.name as facultyName,
        d.name as departmentName,
        l.code as labCode,
        l.name as labName
      FROM devices dev
      JOIN laboratories l ON dev.currentLaboratoryId = l.id
      LEFT JOIN faculties f ON dev.currentFacultyId = f.id
      LEFT JOIN departments d ON dev.currentDepartmentId = d.id
      WHERE l.code = 'LABPH508'
      LIMIT 1
    `) as any;

    if (devices.length > 0) {
      const dev = devices[0];
      console.log('✅ Device from LABPH508:');
      console.log(`  Name: ${dev.name}`);
      console.log(`  DeviceID: ${dev.deviceId}`);
      console.log(`  QR Token: ${dev.qrCodeToken}`);
      console.log(`  Faculty: ${dev.facultyName || 'NULL'}`);
      console.log(`  Department: ${dev.departmentName} (ID: ${dev.currentDepartmentId})`);
      console.log(`  Lab: ${dev.labName} (${dev.labCode})`);
    }

  } finally {
    await conn.end();
  }
}

verifyQRDevice().catch(console.error);

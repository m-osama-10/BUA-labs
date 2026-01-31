import mysql from 'mysql2/promise';

async function testQREndpoint() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1995105',
    database: 'bua_assets'
  });

  try {
    // Get QR tokens from Lab Ph 508
    const [devices] = await conn.query(`
      SELECT qrCodeToken FROM devices 
      WHERE currentLaboratoryId = (SELECT id FROM laboratories WHERE code = 'LABPH508')
      LIMIT 3
    `) as any;

    if (devices.length > 0) {
      for (const device of devices) {
        console.log(`\n🔍 Testing QR Token: ${device.qrCodeToken}`);
        
        // Simulate what the endpoint does
        const [result] = await conn.query(`
          SELECT 
            dev.*,
            f.name as facultyName,
            d.name as departmentName,
            l.code as laboratoryCode,
            l.name as laboratoryName
          FROM devices dev
          LEFT JOIN faculties f ON dev.currentFacultyId = f.id
          LEFT JOIN departments d ON dev.currentDepartmentId = d.id
          LEFT JOIN laboratories l ON dev.currentLaboratoryId = l.id
          WHERE dev.qrCodeToken = ?
        `, [device.qrCodeToken]) as any;

        if (result.length > 0) {
          const dev = result[0];
          console.log(`  Device: ${dev.name}`);
          console.log(`  currentDepartmentId: ${dev.currentDepartmentId}`);
          console.log(`  departmentName (from join): ${dev.departmentName}`);
          console.log(`  laboratoryName: ${dev.laboratoryName}`);
          console.log(`  facultyName: ${dev.facultyName}`);
        }
      }
    }

  } finally {
    await conn.end();
  }
}

testQREndpoint().catch(console.error);

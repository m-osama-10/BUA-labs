import mysql from 'mysql2/promise';

async function checkQRDeviceData() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1995105',
    database: 'bua_assets'
  });

  try {
    // Get a device with its QR token and check department
    const [devices] = await conn.query(`
      SELECT d.id, d.name, d.deviceId, d.qrCodeToken, 
             d.currentDepartmentId, dept.name as deptName,
             d.currentFacultyId, f.name as facultyName,
             d.currentLaboratoryId, l.name as labName
      FROM devices d
      LEFT JOIN departments dept ON d.currentDepartmentId = dept.id
      LEFT JOIN faculties f ON d.currentFacultyId = f.id
      LEFT JOIN laboratories l ON d.currentLaboratoryId = l.id
      WHERE d.currentFacultyId = 1
      LIMIT 1
    `) as any;
    
    if (devices.length > 0) {
      const dev = devices[0];
      console.log('Device from database:');
      console.log(`ID: ${dev.id}`);
      console.log(`Name: ${dev.name}`);
      console.log(`QR Token: ${dev.qrCodeToken}`);
      console.log(`Faculty ID: ${dev.currentFacultyId} -> ${dev.facultyName}`);
      console.log(`Department ID: ${dev.currentDepartmentId} -> ${dev.deptName}`);
      console.log(`Lab ID: ${dev.currentLaboratoryId} -> ${dev.labName}`);
      
      // Now test the query by QR token
      const [byToken] = await conn.query(`
        SELECT d.*, dept.name as deptName, f.name as facultyName, l.name as labName
        FROM devices d
        LEFT JOIN departments dept ON d.currentDepartmentId = dept.id
        LEFT JOIN faculties f ON d.currentFacultyId = f.id
        LEFT JOIN laboratories l ON d.currentLaboratoryId = l.id
        WHERE d.qrCodeToken = ?
      `, [dev.qrCodeToken]) as any;
      
      if (byToken.length > 0) {
        console.log('\nDevice by QR token:');
        console.log(`Department Name: ${byToken[0].deptName}`);
        console.log(`Faculty Name: ${byToken[0].facultyName}`);
        console.log(`Lab Name: ${byToken[0].labName}`);
      }
    }
    
  } finally {
    await conn.end();
  }
}

checkQRDeviceData().catch(console.error);

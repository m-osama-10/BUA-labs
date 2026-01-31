import mysql from 'mysql2/promise';

async function checkTransferIssue() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1995105',
    database: 'bua_assets'
  });

  try {
    // Get sample pharmacy devices
    const [devices] = await conn.query(`
      SELECT d.id, d.name, d.currentLaboratoryId, d.currentDepartmentId, d.currentFacultyId, 
             f.name as facultyName, dept.name as deptName, l.name as labName
      FROM devices d
      LEFT JOIN faculties f ON d.currentFacultyId = f.id
      LEFT JOIN departments dept ON d.currentDepartmentId = dept.id
      LEFT JOIN laboratories l ON d.currentLaboratoryId = l.id
      WHERE f.code = 'Ph'
      LIMIT 5
    `);
    
    console.log('Sample pharmacy devices:');
    console.log(JSON.stringify(devices, null, 2));
    
    // Check if we have any labs for pharmacy
    const [pharmacyLabs] = await conn.query(`
      SELECT l.id, l.name, l.code, d.id as deptId, d.name as deptName, f.id as facultyId, f.name as facultyName
      FROM laboratories l
      JOIN departments d ON l.departmentId = d.id
      JOIN faculties f ON d.facultyId = f.id
      WHERE f.code = 'Ph'
      LIMIT 10
    `);
    
    console.log('\nPharmacy labs:');
    console.log(JSON.stringify(pharmacyLabs, null, 2));
    
    // Check all faculties and their departments
    const [faculties] = await conn.query(`
      SELECT f.id, f.name, f.code, 
             (SELECT COUNT(*) FROM departments WHERE facultyId = f.id) as deptCount,
             (SELECT COUNT(*) FROM laboratories l 
              JOIN departments d ON l.departmentId = d.id 
              WHERE d.facultyId = f.id) as labCount
      FROM faculties f
    `);
    
    console.log('\nFaculties with counts:');
    console.log(JSON.stringify(faculties, null, 2));
    
  } finally {
    await conn.end();
  }
}

checkTransferIssue().catch(console.error);

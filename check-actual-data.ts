import mysql from 'mysql2/promise';

async function checkActualData() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1995105',
    database: 'bua_assets'
  });

  try {
    // Check actual device distribution from database
    const [distribution] = await conn.query(`
      SELECT d.id, d.name, d.currentDepartmentId, dept.name as deptName
      FROM devices d
      LEFT JOIN departments dept ON d.currentDepartmentId = dept.id
      WHERE d.currentFacultyId = 1
      ORDER BY d.id
      LIMIT 10
    `) as any;
    
    console.log('First 10 devices from database:');
    distribution.forEach((dev: any) => {
      console.log(`ID: ${dev.id} | Name: ${dev.name} | DeptID: ${dev.currentDepartmentId} | DeptName: ${dev.deptName}`);
    });
    
    // Count by department
    const [counts] = await conn.query(`
      SELECT d.id, d.name, COUNT(dev.id) as count
      FROM departments d
      LEFT JOIN devices dev ON dev.currentDepartmentId = d.id
      WHERE d.facultyId = 1
      GROUP BY d.id
      ORDER BY count DESC
    `) as any;
    
    console.log('\nDepartment counts:');
    counts.forEach((row: any) => {
      console.log(`${row.name}: ${row.count}`);
    });
    
  } finally {
    await conn.end();
  }
}

checkActualData().catch(console.error);

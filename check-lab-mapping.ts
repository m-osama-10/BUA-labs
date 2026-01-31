import mysql from 'mysql2/promise';

async function checkLabMapping() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1995105',
    database: 'bua_assets'
  });

  try {
    // Get all pharmacy labs
    const [labs] = await conn.query(`
      SELECT 
        l.id,
        l.code,
        l.name,
        d.id as deptId,
        d.name as deptName,
        d.code as deptCode,
        f.id as facultyId,
        f.name as facultyName,
        f.code as facultyCode
      FROM laboratories l
      JOIN departments d ON l.departmentId = d.id
      JOIN faculties f ON d.facultyId = f.id
      WHERE f.id = 1
      ORDER BY l.name
      LIMIT 20
    `);
    
    console.log('All Pharmacy Labs (Faculty 1):');
    console.log(JSON.stringify(labs, null, 2));
    
    // Check departments for pharmacy
    const [depts] = await conn.query(`
      SELECT id, name, code, facultyId
      FROM departments
      WHERE facultyId = 1
      ORDER BY name
    `);
    
    console.log('\nAll Pharmacy Departments:');
    console.log(JSON.stringify(depts, null, 2));
    
  } finally {
    await conn.end();
  }
}

checkLabMapping().catch(console.error);

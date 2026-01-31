import mysql from 'mysql2/promise';

async function checkLaboratoryDepartments() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1995105',
    database: 'bua_assets'
  });

  try {
    // Check laboratory that contains device in Lab Ph 508
    const [labs] = await conn.query(`
      SELECT l.id, l.name, l.code, l.departmentId, d.name as deptName
      FROM laboratories l
      LEFT JOIN departments d ON l.departmentId = d.id
      WHERE l.code LIKE '%508%' OR l.name LIKE '%508%'
    `) as any;
    
    console.log('Lab Ph 508:');
    console.log(JSON.stringify(labs, null, 2));
    
    // Check all pharmacy labs and their departments
    const [allLabs] = await conn.query(`
      SELECT l.id, l.name, l.code, l.departmentId, d.name as deptName
      FROM laboratories l
      LEFT JOIN departments d ON l.departmentId = d.id
      WHERE l.name LIKE '%Ph%'
      ORDER BY l.name
      LIMIT 10
    `) as any;
    
    console.log('\nAll Ph labs:');
    allLabs.forEach((lab: any) => {
      console.log(`${lab.code}: ${lab.name} -> Dept ${lab.departmentId} (${lab.deptName})`);
    });
    
  } finally {
    await conn.end();
  }
}

checkLaboratoryDepartments().catch(console.error);

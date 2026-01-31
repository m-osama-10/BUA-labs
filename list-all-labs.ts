import mysql from 'mysql2/promise';

async function getAllLabs() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1995105',
    database: 'bua_assets'
  });

  try {
    const [rows] = await conn.query(`
      SELECT id, code, name, departmentId FROM laboratories 
      WHERE code LIKE '%LAB%' OR code LIKE '%TASH%'
      ORDER BY code
    `) as any;

    console.log('📊 All Laboratories:');
    console.log('='.repeat(80));
    
    rows.forEach((lab: any) => {
      console.log(`${lab.code.padEnd(15)} | ${lab.name.padEnd(30)} | Dept: ${lab.departmentId}`);
    });
    
    console.log(`\n📈 Total labs: ${rows.length}`);

  } finally {
    await conn.end();
  }
}

getAllLabs().catch(console.error);

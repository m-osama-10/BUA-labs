import mysql from 'mysql2/promise';

async function getLaboratories() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1995105',
    database: 'bua_assets',
  });

  try {
    const [labs] = await conn.query(
      `SELECT l.id, l.name, d.name as dept, f.name as faculty 
       FROM laboratories l 
       JOIN departments d ON l.departmentId = d.id 
       JOIN faculties f ON d.facultyId = f.id 
       ORDER BY f.id, d.id, l.id`
    );

    console.log('\n📋 قائمة المختبرات المتاحة:\n');
    console.log('Lab ID | Laboratory Name | Department | Faculty');
    console.log('-------|-----------------|------------|---------');
    
    (labs as any).forEach((l: any) => {
      console.log(
        `${String(l.id).padEnd(6)} | ${l.name.padEnd(16)} | ${l.dept.padEnd(11)} | ${l.faculty}`
      );
    });

    console.log(`\n✅ إجمالي: ${(labs as any).length} مختبر\n`);
    
    return labs;
  } finally {
    await conn.end();
  }
}

getLaboratories().catch(console.error);

import mysql from 'mysql2/promise';

async function fixRemainingWrongDepts() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1995105',
    database: 'bua_assets'
  });

  try {
    console.log('🔧 Fixing remaining devices with wrong department...\n');

    // Update devices to use their lab's correct department
    const [result] = await conn.query(`
      UPDATE devices dev
      JOIN laboratories l ON dev.currentLaboratoryId = l.id
      SET dev.currentDepartmentId = l.departmentId
      WHERE dev.currentDepartmentId = 25 AND l.code LIKE 'LABPH%'
    `) as any;

    console.log(`✅ Updated ${result.affectedRows} devices\n`);

    // Verify
    const [verification] = await conn.query(`
      SELECT 
        dev.name,
        l.code,
        dev.currentDepartmentId,
        d.name as deptName,
        l.departmentId as labDeptId
      FROM devices dev
      JOIN laboratories l ON dev.currentLaboratoryId = l.id
      LEFT JOIN departments d ON dev.currentDepartmentId = d.id
      WHERE l.code LIKE 'LABPH%' AND dev.currentDepartmentId = 25
    `) as any;

    if (verification.length > 0) {
      console.log('⚠️ Still have devices with wrong department:');
      verification.forEach((dev: any) => {
        console.log(`  ${dev.name} | Lab: ${dev.code} | Wrong Dept: ${dev.currentDepartmentId}`);
      });
    } else {
      console.log('✅ All devices now have correct departments!');
    }

  } finally {
    await conn.end();
  }
}

fixRemainingWrongDepts().catch(console.error);

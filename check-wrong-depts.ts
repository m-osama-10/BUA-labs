import mysql from 'mysql2/promise';

async function checkWrongDepts() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1995105',
    database: 'bua_assets'
  });

  try {
    // Check devices with wrong department (25)
    const [devices] = await conn.query(`
      SELECT 
        COUNT(*) as totalWrong,
        COUNT(DISTINCT currentLaboratoryId) as labsAffected
      FROM devices 
      WHERE currentDepartmentId = 25 AND currentLaboratoryId IN (
        SELECT id FROM laboratories WHERE code LIKE 'LABPH%'
      )
    `) as any;

    console.log(`❌ Devices with wrong department (25):`, devices[0]);

    // Get sample
    const [samples] = await conn.query(`
      SELECT 
        dev.id,
        dev.name,
        dev.deviceId,
        dev.currentDepartmentId,
        l.code,
        l.departmentId as labDeptId
      FROM devices dev
      JOIN laboratories l ON dev.currentLaboratoryId = l.id
      WHERE dev.currentDepartmentId = 25 AND l.code LIKE 'LABPH%'
      LIMIT 10
    `) as any;

    console.log('\n📋 Sample devices with wrong department:');
    samples.forEach((dev: any) => {
      console.log(`  ${dev.name.padEnd(30)} | Lab: ${dev.code} | Dept: ${dev.currentDepartmentId} (Lab should be: ${dev.labDeptId})`);
    });

  } finally {
    await conn.end();
  }
}

checkWrongDepts().catch(console.error);

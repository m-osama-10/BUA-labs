import mysql from 'mysql2/promise';

async function fixLaboratoryDepartments() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1995105',
    database: 'bua_assets'
  });

  try {
    // Mapping of laboratory codes to department IDs based on floor/function
    const labDeptMapping: { [key: string]: number } = {
      // Floor 1 - Chemistry (قسم الكيمياء الصيدلية - ID 21)
      'LABPH101': 21,
      'LABPH102': 21,
      'LABPH103': 21,
      'LABPH104': 21,
      'LABPH105': 21,
      'LABPH106': 21,
      'LABPH209': 21, // Chemistry floor
      'LABPH210': 21,
      'LABPH211': 21,
      
      // Floor 2 - Pharmaceutics (قسم الصيدلانيات - ID 24)
      'LABPH204': 24,
      'LABPH206': 24,
      'LABPH502': 24,
      'LABPH503': 24,
      'LABPH505': 24,
      'LABPH508': 24,
      
      // Biochemistry labs (قسم البايوكمستري - ID 22)
      'LABPHS416': 22,
      'LABPHS417': 22,
      'LABPHS418': 22,
      'LABPHS419': 22,
      'LABTASH403': 22,
      'LABTASH412': 22,
      'LABTASH413': 22,
      'LABTASH414': 22,
      
      // Pharmacology (قسم العقاقير - ID 23)
      'LABPH306': 23,
      'LABPH307': 23,
      'LABPH406': 23,
      'LABPH412': 23,
      'LABPH413': 23,
      'LABPH414': 23,
    };

    let updated = 0;
    let failed = 0;

    for (const [code, deptId] of Object.entries(labDeptMapping)) {
      try {
        const [result] = await conn.query(
          `UPDATE laboratories SET departmentId = ? WHERE code = ?`,
          [deptId, code]
        ) as any;

        if (result.affectedRows > 0) {
          updated++;
          console.log(`✓ Updated ${code} -> Dept ${deptId}`);
        } else {
          console.log(`⚠️ ${code} not found`);
          failed++;
        }
      } catch (error) {
        console.error(`❌ Error updating ${code}:`, error);
        failed++;
      }
    }

    console.log(`\n📋 Summary: Updated ${updated} labs, ${failed} failed`);

  } finally {
    await conn.end();
  }
}

fixLaboratoryDepartments().catch(console.error);

import mysql from 'mysql2/promise';

async function addDepartments() {
  try {
    console.log('🔄 جاري الاتصال بـ MySQL...\n');

    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '1995105',
      database: 'bua_assets'
    });

    console.log('✅ تم الاتصال بنجاح!\n');

    // Add 4 new departments to Pharmacy (facultyId = 1)
    const departments = [
      { name: 'قسم الكيمياء الصيدلية', code: 'PHARM-PHCHEM' },
      { name: 'قسم البايوكمستري', code: 'PHARM-BIOCHEM' },
      { name: 'قسم العقاقير', code: 'PHARM-PHARM' },
      { name: 'قسم الصيدلانيات', code: 'PHARM-TECH' }
    ];

    console.log('📝 جاري إضافة الأقسام الجديدة...\n');

    for (const dept of departments) {
      try {
        await connection.query(
          'INSERT INTO departments (facultyId, name, code, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
          [1, dept.name, dept.code]
        );
        console.log(`✅ تم إضافة: ${dept.name}`);
      } catch (err: any) {
        console.error(`❌ خطأ: ${err.message}`);
      }
    }

    // Verify
    console.log('\n📊 التحقق من البيانات:\n');
    const [result] = await connection.query(
      'SELECT name, code FROM departments WHERE facultyId = 1 ORDER BY id'
    );

    console.log('أقسام كلية الصيدلة:');
    (result as any).forEach((dept: any) => {
      console.log(`   • ${dept.name}`);
    });

    console.log(`\n✅ إجمالي الأقسام: ${(result as any).length}\n`);

    await connection.end();
  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

addDepartments();

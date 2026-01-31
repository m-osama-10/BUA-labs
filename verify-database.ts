import mysql from 'mysql2/promise';

async function verifyDatabase() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '1995105',
      database: 'bua_assets'
    });

    console.log('\n📊 الجداول المتوفرة:\n');
    
    const [tables] = await conn.query(
      'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME',
      ['bua_assets']
    );

    (tables as any).forEach((t: any, i: number) => {
      console.log(`   ${i + 1}. ${t.TABLE_NAME}`);
    });

    console.log(`\n✅ إجمالي: ${(tables as any).length} جداول\n`);

    console.log('📈 البيانات الموجودة:\n');
    
    const [counts] = await conn.query('SELECT COUNT(*) as fac FROM faculties');
    const [depts] = await conn.query('SELECT COUNT(*) as dept FROM departments');
    const [labs] = await conn.query('SELECT COUNT(*) as lab FROM laboratories');
    const [devices] = await conn.query('SELECT COUNT(*) as dev FROM devices');

    console.log(`   • الكليات: ${(counts as any)[0].fac}`);
    console.log(`   • الأقسام: ${(depts as any)[0].dept}`);
    console.log(`   • المختبرات: ${(labs as any)[0].lab}`);
    console.log(`   • الأجهزة: ${(devices as any)[0].dev}\n`);

    console.log('✅ النظام جاهز للاستخدام! 🚀\n');

    await conn.end();
  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

verifyDatabase();

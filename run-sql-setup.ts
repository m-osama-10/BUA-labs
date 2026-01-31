import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function runSQLSetup() {
  try {
    console.log('🔄 جاري الاتصال بـ MySQL...\n');

    // Create connection first WITHOUT specifying database
    let connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '1995105',
      multipleStatements: false
    });

    console.log('✅ تم الاتصال بنجاح!\n');

    // Read SQL file
    const sqlFile = path.join(process.cwd(), 'database-complete-setup.sql');
    if (!fs.existsSync(sqlFile)) {
      console.error('❌ لم نجد الملف: database-complete-setup.sql');
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf-8');
    console.log('📝 جاري تنفيذ أوامر SQL...\n');

    // Split and execute queries - remove comments properly
    const lines = sqlContent.split('\n');
    let currentQuery = '';
    
    const queries: string[] = [];
    
    for (const line of lines) {
      // Skip comment lines
      if (line.trim().startsWith('--') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
        continue;
      }
      
      currentQuery += line + '\n';
      
      // When we hit a semicolon, we have a complete query
      if (line.includes(';')) {
        const query = currentQuery
          .split(';')
          .map(q => q.trim())
          .filter(q => q)[0];
        
        if (query) {
          queries.push(query);
        }
        
        currentQuery = '';
      }
    }
    
    // Add any remaining query
    if (currentQuery.trim()) {
      queries.push(currentQuery.trim());
    }

    console.log(`📊 พบ ${queries.length} أوامر\n`);

    let executed = 0;
    for (const query of queries) {
      try {
        await connection.query(query);
        executed++;
        // Only log important statements
        if (query.toUpperCase().includes('CREATE') || query.toUpperCase().includes('INSERT')) {
          const preview = query.replace(/\n/g, ' ').substring(0, 60);
          console.log('✅', preview + (query.length > 60 ? '...' : ''));
        }
      } catch (err: any) {
        // Skip certain errors
        if (!err.message.includes('already exists') && !err.message.includes('Duplicate')) {
          console.error('⚠️ ', err.message.substring(0, 80));
        }
      }
    }

    console.log(`\n✅ تم تنفيذ ${executed} أوامر\n`);

    // Verify data - need to query by selecting from the database
    console.log('📊 التحقق من البيانات:\n');
    
    const [faculties] = await connection.query('SELECT COUNT(*) as count FROM bua_assets.faculties');
    const [departments] = await connection.query('SELECT COUNT(*) as count FROM bua_assets.departments');
    const [labs] = await connection.query('SELECT COUNT(*) as count FROM bua_assets.laboratories');

    const facultyCount = (faculties as any)[0].count;
    const deptCount = (departments as any)[0].count;
    const labCount = (labs as any)[0].count;

    console.log(`✅ الكليات: ${facultyCount}`);
    console.log(`✅ الأقسام: ${deptCount}`);
    console.log(`✅ المختبرات: ${labCount}\n`);

    if (facultyCount === 8 && deptCount >= 20 && labCount >= 21) {
      console.log('🎉 جميع البيانات تم إدراجها بنجاح!\n');
      console.log('🚀 الخطوات التالية:');
      console.log('   1. npm run dev');
      console.log('   2. اذهب إلى: http://localhost:3000/devices/new');
      console.log('   3. ستري الـ 8 كليات الآن! 🎉\n');
    }

    await connection.end();
  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
    console.error('\n💡 تأكد من:');
    console.error('   1. MySQL يعمل بشكل صحيح');
    console.error('   2. كلمة المرور صحيحة');
    console.error('   3. ملف database-complete-setup.sql موجود\n');
    process.exit(1);
  }
}

runSQLSetup();

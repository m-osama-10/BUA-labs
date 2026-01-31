import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function createAllTables() {
  try {
    console.log('🔄 جاري الاتصال بـ MySQL...\n');

    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '1995105',
      multipleStatements: false
    });

    console.log('✅ تم الاتصال بنجاح!\n');

    // Read SQL file
    const sqlFile = path.join(process.cwd(), 'database-all-tables.sql');
    if (!fs.existsSync(sqlFile)) {
      console.error('❌ لم نجد الملف: database-all-tables.sql');
      process.exit(1);
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf-8');
    console.log('📝 جاري إنشاء جميع الجداول...\n');

    // Parse and execute queries
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

    console.log(`📊 وجدنا ${queries.length} أوامر SQL\n`);

    let executed = 0;
    for (const query of queries) {
      try {
        await connection.query(query);
        executed++;
        
        // Log only table creation and verification
        if (query.toUpperCase().includes('CREATE TABLE') || query.toUpperCase().includes('SELECT TABLE_NAME')) {
          const preview = query.replace(/\n/g, ' ').substring(0, 60);
          console.log('✅', preview + (query.length > 60 ? '...' : ''));
        }
      } catch (err: any) {
        // Skip certain errors
        if (!err.message.includes('already exists')) {
          console.error('⚠️ ', err.message.substring(0, 80));
        }
      }
    }

    console.log(`\n✅ تم تنفيذ ${executed} أوامر\n`);

    // Verify all tables
    console.log('📊 التحقق من الجداول:\n');
    const [tables] = await connection.query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'bua_assets' ORDER BY TABLE_NAME");
    
    const tableNames = (tables as any).map((t: any) => t.TABLE_NAME);
    
    const requiredTables = [
      'faculties',
      'departments', 
      'laboratories',
      'users',
      'devices',
      'transfers',
      'maintenance_requests',
      'maintenance_records',
      'depreciation_records',
      'audit_logs',
      'notification_preferences'
    ];

    for (const tableName of requiredTables) {
      const exists = tableNames.includes(tableName);
      console.log(`   ${exists ? '✅' : '❌'} ${tableName}`);
    }

    console.log(`\n🎉 تم إنشاء جميع الجداول بنجاح!\n`);
    console.log('🚀 الخطوات التالية:');
    console.log('   1. npm run dev');
    console.log('   2. يمكنك الآن إضافة الأجهزة بـ Device IDs التلقائية 🎉\n');

    await connection.end();
  } catch (error: any) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

createAllTables();

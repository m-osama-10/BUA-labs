import mysql from 'mysql2/promise';

async function showDeviceStats() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1995105',
    database: 'bua_assets',
  });

  try {
    console.log('\n📊 Devices Summary:\n');

    // Count by category
    const [categoryData] = await conn.query(
      `SELECT category, COUNT(*) as count 
       FROM devices 
       GROUP BY category 
       ORDER BY count DESC`
    );

    console.log('📂 By Category:');
    (categoryData as any).forEach((row: any) => {
      console.log(`   ${row.category}: ${row.count}`);
    });

    // Total devices
    const [totalData] = await conn.query('SELECT COUNT(*) as total FROM devices');
    const total = (totalData as any)[0].total;
    console.log(`\n✅ Total devices: ${total}\n`);

    // Count by status
    const [statusData] = await conn.query(
      `SELECT currentStatus, COUNT(*) as count 
       FROM devices 
       GROUP BY currentStatus`
    );

    console.log('🔧 By Status:');
    (statusData as any).forEach((row: any) => {
      console.log(`   ${row.currentStatus}: ${row.count}`);
    });

    // Sample devices
    const [sampleData] = await conn.query(
      `SELECT deviceId, name, category, currentStatus 
       FROM devices 
       LIMIT 5`
    );

    console.log('\n📋 Sample Devices:');
    (sampleData as any).forEach((row: any) => {
      console.log(`   ${row.deviceId} - ${row.name} (${row.currentStatus})`);
    });
    console.log();

  } finally {
    await conn.end();
  }
}

showDeviceStats().catch(console.error);

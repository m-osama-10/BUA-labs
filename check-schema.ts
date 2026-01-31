import mysql from 'mysql2/promise';

async function checkSchema() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1995105',
    database: 'bua_assets'
  });

  try {
    const [devices] = await conn.query(`DESCRIBE devices`) as any;
    console.log('📋 Devices table columns:');
    devices.forEach((col: any) => {
      console.log(`  ${col.Field.padEnd(25)} | ${col.Type}`);
    });
    
    const [labs] = await conn.query(`DESCRIBE laboratories`) as any;
    console.log('\n📋 Laboratories table columns:');
    labs.forEach((col: any) => {
      console.log(`  ${col.Field.padEnd(25)} | ${col.Type}`);
    });

  } finally {
    await conn.end();
  }
}

checkSchema().catch(console.error);

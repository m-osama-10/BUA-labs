import mysql from 'mysql2/promise';

async function createTestUser() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1995105',
    database: 'bua_assets',
  });

  try {
    // Delete existing test user
    await conn.execute('DELETE FROM users WHERE openId = ?', ['test@bua.edu.eg']);

    // Create test user
    const [result] = await conn.execute(
      `INSERT INTO users (openId, name, email, loginMethod, role) 
       VALUES (?, ?, ?, ?, ?)`,
      ['test@bua.edu.eg', 'Test User', 'test@bua.edu.eg', 'system', 'admin']
    );

    const userId = (result as any).insertId;

    console.log(`\n✅ Test user created:`);
    console.log(`   ID: ${userId}`);
    console.log(`   Email: test@bua.edu.eg`);
    console.log(`   Role: admin`);
    console.log(`\n⚠️  Note: User needs to login to get a session cookie\n`);

  } finally {
    await conn.end();
  }
}

createTestUser().catch(console.error);

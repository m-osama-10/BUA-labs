import { createConnection } from 'mysql2/promise';

(async () => {
  const conn = await createConnection({
    host: 'localhost',
    user: 'root',
    password: '1995105',
    database: 'bua_assets',
  });

  const [tables] = await conn.query('SHOW TABLES');
  console.log('Tables in database:');
  (tables as any).forEach((t: any) => {
    const tableName = Object.values(t)[0];
    console.log('  -', tableName);
  });

  await conn.end();
})();

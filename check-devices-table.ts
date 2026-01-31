import { createConnection } from "mysql2/promise";

async function describeDevicesTable() {
  const conn = await createConnection({
    host: "localhost",
    user: "root",
    password: "1995105",
    database: "bua_assets",
  });

  const [rows] = await conn.query("DESCRIBE devices");
  console.log("Columns in devices table:");
  (rows as any).forEach((row: any) => {
    console.log(`  ${row.Field}: ${row.Type} ${row.Null === "NO" ? "NOT NULL" : "NULLABLE"}`);
  });

  await conn.end();
}

describeDevicesTable().catch(console.error);

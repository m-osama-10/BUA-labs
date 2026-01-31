import { createConnection } from 'mysql2/promise';
import * as fs from 'fs';
import * as readline from 'readline';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

async function updateDevicesBrand() {
  const conn = await createConnection({
    host: 'localhost',
    user: 'root',
    password: '1995105',
    database: 'bua_assets',
  });

  try {
    console.log('🔄 Adding brand column to devices table...\n');
    
    try {
      await conn.query('ALTER TABLE devices ADD COLUMN brand VARCHAR(255) AFTER name');
      console.log('✅ Brand column added successfully\n');
    } catch (err: any) {
      if (err.message.includes('Duplicate column')) {
        console.log('ℹ️ Brand column already exists\n');
      } else {
        throw err;
      }
    }

    console.log('📊 Reading brand data from CSV...\n');

    const deviceBrands = new Map<string, string>();
    const filePath = 'C:\\Users\\MOsam\\Downloads\\Pharmacy Devices and Report.csv';

    const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let lineNum = 0;
    for await (const line of rl) {
      lineNum++;
      if (lineNum === 1) continue; // Skip header

      if (!line.trim()) continue;

      try {
        const parts = parseCSVLine(line);
        if (parts.length < 3) continue;

        const deviceId = parts[0].trim();
        const brand = parts[2].trim();

        if (deviceId && brand) {
          deviceBrands.set(deviceId, brand);
        }
      } catch (error) {
        // Skip errors in parsing
      }
    }

    console.log(`📝 Found ${deviceBrands.size} devices with brand information\n`);
    console.log('💾 Updating devices with brand information...\n');

    let updatedCount = 0;
    let emptyCount = 0;

    for (const [deviceId, brand] of deviceBrands.entries()) {
      try {
        const [result] = await conn.query(
          'UPDATE devices SET brand = ? WHERE deviceId = ?',
          [brand, deviceId]
        );
        
        if ((result as any).affectedRows > 0) {
          updatedCount++;
        }
      } catch (error) {
        // Skip errors
      }
    }

    // Count devices without brand
    const [emptyDevices] = await conn.query(
      'SELECT COUNT(*) as count FROM devices WHERE brand IS NULL OR brand = ""'
    );

    emptyCount = (emptyDevices as any)[0].count;

    console.log(`✅ Updated ${updatedCount} devices with brand information`);
    console.log(`⚪ ${emptyCount} devices without brand information\n`);

    // Show statistics
    const [stats] = await conn.query(
      `SELECT brand, COUNT(*) as count FROM devices 
       WHERE brand IS NOT NULL AND brand != '' 
       GROUP BY brand 
       ORDER BY count DESC 
       LIMIT 10`
    );

    console.log('🏢 Top brands in the system:');
    (stats as any).forEach((row: any) => {
      console.log(`   ${row.brand}: ${row.count} devices`);
    });

    await conn.end();
    console.log('\n✅ Update completed successfully!');

  } catch (error) {
    console.error('Error:', error);
    await conn.end();
    process.exit(1);
  }
}

updateDevicesBrand()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });

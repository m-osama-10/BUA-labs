import XLSX from 'xlsx';
import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as crypto from 'crypto';

const excelPath = 'C:\\Users\\MOsam\\Downloads\\Pharmacy Devices and Report.xlsx';

interface ImportDevice {
  'Device ID'?: string;
  'Device Name'?: string;
  Brand?: string;
  'Model'?: string;
  Status?: string;
  Department?: string;
  'Location'?: string;
  Notes?: string;
  Serial?: string;
}

interface Laboratory {
  id: number;
  name: string;
  code: string;
  codeNormalized: string;
  nameNormalized: string;
}

// Map location strings to laboratory IDs
function normalizeLocationName(location: string): string {
  return location
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^lab\s+/, '')
    .replace(/^lab\s+ph\s+/, '');
}

function generateQRToken(): string {
  return crypto.randomBytes(16).toString('hex').substring(0, 32);
}

async function ensureAdminUser(conn: mysql.Connection): Promise<number> {
  // Check if admin user exists
  const [users] = await conn.query(
    `SELECT id FROM users WHERE role = 'admin' LIMIT 1`
  );

  if ((users as any[]).length > 0) {
    return (users as any[])[0].id;
  }

  // Create admin user
  const now = new Date();
  const result = await conn.execute(
    `INSERT INTO users (openId, name, email, loginMethod, role) 
     VALUES (?, ?, ?, ?, ?)`,
    ['admin@bua.edu.eg', 'System Admin', 'admin@bua.edu.eg', 'system', 'admin']
  );

  return (result as any)[0].insertId;
}

async function importDevices() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1995105',
    database: 'bua_assets',
  });

  try {
    console.log('\n📂 Reading Excel file...\n');
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets['All Devices List '];
    const devices: ImportDevice[] = XLSX.utils.sheet_to_json(worksheet);

    console.log(`✅ Found ${devices.length} devices in Excel\n`);

    // Ensure admin user exists
    console.log('👤 Checking admin user...\n');
    const adminUserId = await ensureAdminUser(conn);
    console.log(`✅ Admin user ID: ${adminUserId}\n`);

    // Get all laboratories with relationships
    console.log('📍 Loading laboratories from database...\n');
    const [labRows] = await conn.query(
      `SELECT l.id, l.name, l.code, l.departmentId, d.facultyId
       FROM laboratories l 
       JOIN departments d ON l.departmentId = d.id 
       ORDER BY l.id`
    );
    
    const laboratories = (labRows as any[]).map(lab => ({
      id: lab.id,
      name: lab.name,
      code: lab.code,
      codeNormalized: lab.code.toUpperCase().replace(/\s+/g, ''),
      nameNormalized: lab.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/^مختبر\s+/, ''),
    }));

    // Build location mapping using both code and name
    const locationMapByCode = new Map<string, Laboratory>();
    const locationMapByName = new Map<string, Laboratory>();
    
    laboratories.forEach(lab => {
      locationMapByCode.set(lab.codeNormalized, lab);
      // Also store by normalized name for fallback
      const nameNormalized = lab.name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/^مختبر\s+/, '');
      locationMapByName.set(nameNormalized, lab);
    });

    console.log(`✅ Loaded ${laboratories.length} laboratories\n`);

    // Get device count per category
    const [deviceCounts] = await conn.query(
      `SELECT category, COUNT(*) as count FROM devices GROUP BY category`
    );
    const deviceCountMap = new Map<string, number>();
    (deviceCounts as any[]).forEach(row => {
      deviceCountMap.set(row.category, row.count);
    });

    console.log('📊 Processing devices...\n');

    const imported: any[] = [];
    const failed: any[] = [];
    const unmappedLocations = new Set<string>();

    for (let i = 0; i < devices.length; i++) {
      const device = devices[i];
      const deviceName = String(device['Device Name'] || '').trim();
      const location = String(device['Location'] || '').trim();
      const brand = String(device.Brand || '').trim();
      const model = String(device['Model'] || '').trim();
      const status = String(device['Status'] || 'Working').trim();
      const notes = String(device.Notes || '').trim();

      if (!deviceName) {
        failed.push({ row: i + 1, reason: 'No device name' });
        continue;
      }

      // Try to map location to laboratory
      const normalizedLocation = location.toUpperCase().replace(/\s+/g, '');
      let laboratory = locationMapByCode.get(normalizedLocation);

      if (!laboratory) {
        unmappedLocations.add(location);
        failed.push({
          row: i + 1,
          device: deviceName,
          location,
          reason: 'Location not found in database',
        });
        continue;
      }

      // Extract device type/category from device name or Device ID
      let category: string | null = null;
      const deviceId = device['Device ID']?.trim() || '';
      
      // Try to extract from Device ID first (format: Ph101-WB001)
      const typeMatch = deviceId.match(/-(.*?)(\d+)$/);
      if (typeMatch) {
        category = typeMatch[1].trim();
      } else {
        // Try to extract from device name
        const categoryPatterns: { [key: string]: string[] } = {
          'WB': ['water bath', 'water-bath'],
          'HP': ['hot plate', 'hot-plate'],
          'As': ['aspirator', 'aspirat'],
          'FH': ['fume hood', 'fume-hood'],
          'SP': ['spectro', 'spectroph'],
          'pH': ['ph meter', 'ph-meter'],
          'Ds': ['distill'],
          'MS': ['microscope', 'micro'],
          'DB': ['digital balance', 'balance'],
          'MP': ['melting point', 'melting-point'],
          'DRB': ['dry bath'],
          'CF': ['centrifuge', 'centre'],
          'VoM': ['vortex'],
          'EHS': ['overhead stirr', 'electronic over head', 'electronic overhead'],
          'HH': ['hand held', 'handheld'],
          'Ov': ['oven'],
        };

        const nameLower = deviceName.toLowerCase();
        for (const [cat, patterns] of Object.entries(categoryPatterns)) {
          if (patterns.some(p => nameLower.includes(p))) {
            category = cat;
            break;
          }
        }
      }

      if (!category) {
        failed.push({
          row: i + 1,
          device: deviceName,
          reason: 'Could not determine device category',
        });
        continue;
      }

      // Generate next sequence number for this category and laboratory
      const currentCount = deviceCountMap.get(category) || 0;
      const nextSequence = String(currentCount + 1).padStart(3, '0');

      // Generate Device ID
      const deviceIdGenerated = `PHARM${laboratory.id}-${category}${nextSequence}`;

      // Parse purchase date (default to today if not found)
      let purchaseDate = new Date().toISOString().split('T')[0];

      // Use default values for data
      const purchasePrice = 0;
      const expectedLifetimeYears = 5;

      // Insert device
      try {
        await conn.execute(
          `INSERT INTO devices (
            deviceId, name, category, currentLaboratoryId, currentDepartmentId, 
            currentFacultyId, purchaseDate, purchasePrice, expectedLifetimeYears,
            currentStatus, notes, qrCodeToken, createdBy
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            deviceIdGenerated,
            deviceName,
            category,
            laboratory.id,
            2, // hardcoded department ID for now
            1, // hardcoded faculty ID for now
            purchaseDate,
            purchasePrice,
            expectedLifetimeYears,
            status === 'Not working' ? 'out_of_service' : 'working',
            notes,
            generateQRToken(),
            adminUserId,
          ]
        );

        imported.push({
          deviceId: deviceIdGenerated,
          name: deviceName,
          category,
          location: laboratory.name,
        });

        // Update count
        deviceCountMap.set(category, (deviceCountMap.get(category) || 0) + 1);

        if ((i + 1) % 50 === 0) {
          console.log(`   ⏳ Processed ${i + 1}/${devices.length}...`);
        }
      } catch (error) {
        failed.push({
          row: i + 1,
          device: deviceName,
          reason: (error as any).message,
        });
      }
    }

    console.log(`\n✅ Successfully imported ${imported.length} devices\n`);
    console.log(`❌ Failed to import ${failed.length} devices\n`);

    if (unmappedLocations.size > 0) {
      console.log(`⚠️  Unmapped locations (${unmappedLocations.size}):`);
      Array.from(unmappedLocations)
        .sort()
        .forEach(loc => {
          console.log(`   - ${loc}`);
        });
      console.log();
    }

    if (failed.length > 0 && failed.length <= 20) {
      console.log('❌ Failed devices:');
      failed.slice(0, 20).forEach(f => {
        console.log(`   Row ${f.row}: ${f.device || 'N/A'} - ${f.reason}`);
      });
      if (failed.length > 20) {
        console.log(`   ... and ${failed.length - 20} more`);
      }
      console.log();
    }

    // Show summary
    console.log('📈 Import Summary:');
    console.log(`   Total devices in Excel: ${devices.length}`);
    console.log(`   Successfully imported: ${imported.length}`);
    console.log(`   Failed: ${failed.length}`);
    console.log(`   Success rate: ${((imported.length / devices.length) * 100).toFixed(1)}%\n`);

    // Save logs
    const logPath = 'import-log.json';
    fs.writeFileSync(
      logPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          totalDevices: devices.length,
          imported: imported.length,
          failed: failed.length,
          failedDetails: failed,
          unmappedLocations: Array.from(unmappedLocations),
        },
        null,
        2
      )
    );
    console.log(`📝 Log saved to ${logPath}\n`);

  } finally {
    await conn.end();
  }
}

importDevices().catch(console.error);

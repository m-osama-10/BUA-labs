import mysql from 'mysql2/promise';

/**
 * Generate Device ID automatically
 * Format: FacultyCode + LaboratoryId + DeviceTypeCode + SequenceNumber
 * Example: Ph101-WB001
 *   Ph = Pharmacy (faculty code)
 *   101 = Laboratory ID
 *   WB = Water Bath (device type abbreviation)
 *   001 = Sequential device number in this lab
 */
export async function generateDeviceId(
  facultyCode: string,
  laboratoryId: number,
  deviceName: string,
  connection: mysql.Connection
): Promise<string> {
  try {
    // Extract device type abbreviation from name
    // E.g., "Water Bath" -> "WB", "Centrifuge" -> "CF"
    const deviceTypeCode = extractDeviceTypeCode(deviceName);

    // Get the next sequence number for this lab + device type
    const [result] = await connection.query(
      `SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(deviceId, '-', -1) AS UNSIGNED)), 0) + 1 as nextSequence
       FROM devices 
       WHERE currentLaboratoryId = ? AND deviceId LIKE ?`,
      [laboratoryId, `${facultyCode}${laboratoryId}-${deviceTypeCode}%`]
    );

    const nextSequence = (result as any)[0].nextSequence || 1;
    const sequenceStr = String(nextSequence).padStart(3, '0');

    // Build device ID: FacultyCode + LaboratoryId + DeviceType + Sequence
    const deviceId = `${facultyCode}${laboratoryId}-${deviceTypeCode}${sequenceStr}`;

    return deviceId;
  } catch (error) {
    console.error('Error generating device ID:', error);
    throw error;
  }
}

/**
 * Extract device type code from device name
 * E.g., "Water Bath" -> "WB", "Centrifuge" -> "CF"
 */
function extractDeviceTypeCode(deviceName: string): string {
  // Pharmacy devices mapping - الأجهزة المتاحة حالياً
  const deviceCodeMap: { [key: string]: string } = {
    // Main devices
    'water bath': 'WB',
    'hot plate': 'HP',
    'aspitator': 'As',
    'fume hood': 'FH',
    'spectrophotometer': 'SP',
    'ph meter': 'pH',
    'distillator': 'Ds',
    'microscope': 'MS',
    'digital balance': 'DB',
    'melting point': 'MP',
    'dry bath': 'DRB',
    'centrifuge': 'CF',
    'vortex mixer': 'VoM',
    'electronic overhead stirrer': 'EHS',
    'hand held': 'HH',
    
    // Alternative names
    'water-bath': 'WB',
    'hotplate': 'HP',
    'aspirator': 'As',
    'fume-hood': 'FH',
    'spectro': 'SP',
    'ph-meter': 'pH',
    'distiller': 'Ds',
    'scope': 'MS',
    'balance': 'DB',
    'mp apparatus': 'MP',
    'drybath': 'DRB',
    'cf': 'CF',
    'vortex': 'VoM',
    'stirrer': 'EHS',
    'hand': 'HH',
    'hh': 'HH',
  };

  const lowerName = deviceName.toLowerCase();

  // Check for exact matches first
  for (const [key, code] of Object.entries(deviceCodeMap)) {
    if (lowerName.includes(key)) {
      return code;
    }
  }

  // If no match found, generate from first letters of each word
  const words = lowerName.split(/\s+/);
  let code = words.map(w => w[0].toUpperCase()).join('');

  // Keep it short (max 4 chars)
  code = code.substring(0, 4);

  return code || 'UN'; // UN = Unknown
}

// Test function
async function testDeviceIdGeneration() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1995105',
    database: 'bua_assets'
  });

  try {
    console.log('🧪 اختبار توليد Device ID...\n');

    // Get a lab from database
    const [labs] = await conn.query('SELECT id FROM laboratories LIMIT 1');
    const labId = (labs as any)[0].id;

    // Get faculty code
    const [faculties] = await conn.query(
      `SELECT f.code FROM faculties f 
       JOIN departments d ON f.id = d.facultyId 
       JOIN laboratories l ON d.id = l.departmentId 
       WHERE l.id = ? LIMIT 1`,
      [labId]
    );
    const facultyCode = (faculties as any)[0].code;

    console.log(`✅ Laboratory ID: ${labId}`);
    console.log(`✅ Faculty Code: ${facultyCode}\n`);

    // Test with actual devices
    const testDevices = [
      'Water Bath',
      'Hot Plate',
      'Aspirator',
      'Fume Hood',
      'Spectrophotometer',
      'pH Meter',
      'Distillator',
      'Microscope',
      'Digital Balance',
      'Melting Point',
      'Dry Bath',
      'Centrifuge',
      'Vortex Mixer',
      'Electronic Overhead Stirrer',
      'Hand Held'
    ];

    for (const deviceName of testDevices) {
      const deviceId = await generateDeviceId(facultyCode, labId, deviceName, conn);
      console.log(`   ${deviceName.padEnd(30)} -> ${deviceId}`);
    }

    console.log('\n✅ Test completed!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await conn.end();
  }
}

// Run test if executed directly
if (process.argv[1].includes('generate-device-id')) {
  testDeviceIdGeneration().catch(console.error);
}

export default generateDeviceId;

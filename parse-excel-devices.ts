import XLSX from 'xlsx';
import * as fs from 'fs';

const excelPath = 'C:\\Users\\MOsam\\Downloads\\Pharmacy Devices and Report.xlsx';

interface DeviceRecord {
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

try {
  console.log(`\n📂 Reading devices from: ${excelPath}\n`);
  
  const workbook = XLSX.readFile(excelPath);
  const worksheet = workbook.Sheets['All Devices List '];
  const rawData = XLSX.utils.sheet_to_json<DeviceRecord>(worksheet);

  console.log(`✅ Found ${rawData.length} devices\n`);
  console.log('🔍 Sample data (first 5 devices):\n');

  // Show first 5 devices
  rawData.slice(0, 5).forEach((device, idx) => {
    console.log(`${idx + 1}. ${device['Device Name']}`);
    console.log(`   ID: ${device['Device ID']}`);
    console.log(`   Location: ${device['Location']}`);
    console.log(`   Status: ${device['Status']}`);
    console.log(`   Brand: ${device.Brand}`);
    console.log(`   Notes: ${device.Notes}\n`);
  });

  // Statistics
  console.log('📊 Statistics:');
  
  const statuses = new Map<string, number>();
  const locations = new Map<string, number>();
  const deviceTypes = new Map<string, number>();
  
  rawData.forEach(device => {
    // Count by status
    const status = device['Status']?.trim() || 'Unknown';
    statuses.set(status, (statuses.get(status) || 0) + 1);
    
    // Count by location
    const location = device['Location']?.trim() || 'Unknown';
    locations.set(location, (locations.get(location) || 0) + 1);
    
    // Extract device type from Device ID
    const deviceId = device['Device ID']?.trim() || '';
    const typeMatch = deviceId.match(/-(.*?)(\d+)$/);
    if (typeMatch) {
      const type = typeMatch[1];
      deviceTypes.set(type, (deviceTypes.get(type) || 0) + 1);
    }
  });

  console.log('\n📌 By Status:');
  statuses.forEach((count, status) => {
    console.log(`   ${status}: ${count}`);
  });

  console.log('\n📍 By Location (top 10):');
  const topLocations = Array.from(locations.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  topLocations.forEach(([location, count]) => {
    console.log(`   ${location}: ${count}`);
  });

  console.log('\n🏷️  By Device Type:');
  deviceTypes.forEach((count, type) => {
    console.log(`   ${type}: ${count}`);
  });

  // Save to JSON for import
  const outputPath = 'devices-import-data.json';
  fs.writeFileSync(outputPath, JSON.stringify(rawData, null, 2));
  console.log(`\n✅ Saved ${rawData.length} devices to ${outputPath}`);

} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}

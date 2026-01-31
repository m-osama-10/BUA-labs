#!/usr/bin/env ts-node

import mysql from 'mysql2/promise';
import * as readline from 'readline';

/**
 * Script to import devices data from Excel/CSV
 * استيراد بيانات الأجهزة من Excel/CSV
 */

interface DeviceData {
  deviceName: string;
  category: string;
  laboratoryId: number;
  purchaseDate: string; // YYYY-MM-DD
  purchasePrice: number;
  expectedLifetimeYears: number;
  notes?: string;
}

async function importDevices(devices: DeviceData[]) {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '1995105',
    database: 'bua_assets'
  });

  try {
    console.log('\n🔄 جاري استيراد الأجهزة...\n');

    let importedCount = 0;
    let errorCount = 0;

    for (const device of devices) {
      try {
        // Get laboratory info
        const [labInfo] = await conn.query(
          `SELECT l.id, l.departmentId, d.facultyId 
           FROM laboratories l 
           JOIN departments d ON l.departmentId = d.id 
           WHERE l.id = ?`,
          [device.laboratoryId]
        );

        if ((labInfo as any).length === 0) {
          console.error(`❌ المختبر ${device.laboratoryId} غير موجود`);
          errorCount++;
          continue;
        }

        const lab = (labInfo as any)[0];

        // Get faculty code
        const [facInfo] = await conn.query(
          'SELECT code FROM faculties WHERE id = ?',
          [lab.facultyId]
        );

        const facultyCode = (facInfo as any)[0].code;

        // Generate device ID
        // Get next sequence number
        const deviceTypeCode = extractDeviceTypeCode(device.deviceName);
        const [lastDevice] = await conn.query(
          `SELECT COALESCE(MAX(CAST(SUBSTRING_INDEX(deviceId, '-', -1) AS UNSIGNED)), 0) + 1 as nextSeq
           FROM devices 
           WHERE currentLaboratoryId = ? AND deviceId LIKE ?`,
          [device.laboratoryId, `${facultyCode}${device.laboratoryId}-${deviceTypeCode}%`]
        );

        const nextSeq = String((lastDevice as any)[0].nextSeq).padStart(3, '0');
        const deviceId = `${facultyCode}${device.laboratoryId}-${deviceTypeCode}${nextSeq}`;

        // Generate QR code token
        const qrCodeToken = `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Insert device
        await conn.query(
          `INSERT INTO devices 
           (deviceId, name, category, currentLaboratoryId, currentDepartmentId, currentFacultyId, 
            purchaseDate, purchasePrice, expectedLifetimeYears, currentStatus, notes, qrCodeToken, createdBy)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'working', ?, ?, 1)`,
          [
            deviceId,
            device.deviceName,
            device.category,
            device.laboratoryId,
            lab.departmentId,
            lab.facultyId,
            device.purchaseDate,
            device.purchasePrice,
            device.expectedLifetimeYears,
            device.notes || null,
            qrCodeToken
          ]
        );

        console.log(`✅ ${device.deviceName.padEnd(30)} -> ${deviceId}`);
        importedCount++;
      } catch (err: any) {
        console.error(`❌ خطأ في ${device.deviceName}: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 النتيجة:`);
    console.log(`   ✅ تم استيراد: ${importedCount}`);
    console.log(`   ❌ أخطاء: ${errorCount}\n`);

  } finally {
    await conn.end();
  }
}

function extractDeviceTypeCode(deviceName: string): string {
  const deviceCodeMap: { [key: string]: string } = {
    'water bath': 'WB',
    'hot plate': 'HP',
    'aspirator': 'As',
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
  };

  const lowerName = deviceName.toLowerCase();

  for (const [key, code] of Object.entries(deviceCodeMap)) {
    if (lowerName.includes(key)) {
      return code;
    }
  }

  return 'UN';
}

// Example usage
async function main() {
  const exampleDevices: DeviceData[] = [
    {
      deviceName: 'Water Bath',
      category: 'Laboratory Equipment',
      laboratoryId: 1,
      purchaseDate: '2023-01-15',
      purchasePrice: 5000,
      expectedLifetimeYears: 10,
      notes: 'Original Water Bath Unit'
    },
    {
      deviceName: 'Centrifuge',
      category: 'Laboratory Equipment',
      laboratoryId: 2,
      purchaseDate: '2022-06-20',
      purchasePrice: 15000,
      expectedLifetimeYears: 15,
      notes: 'High-speed centrifuge'
    },
    {
      deviceName: 'Microscope',
      category: 'Laboratory Equipment',
      laboratoryId: 1,
      purchaseDate: '2023-03-10',
      purchasePrice: 8000,
      expectedLifetimeYears: 20
    }
  ];

  console.log('📋 مثال على استيراد الأجهزة:');
  await importDevices(exampleDevices);
}

// Run if executed directly
if (process.argv[1].includes('import-devices')) {
  main().catch(console.error);
}

export { importDevices, DeviceData };

import { createConnection } from 'mysql2/promise';

async function deleteAllDeviceData() {
  const conn = await createConnection({
    host: 'localhost',
    user: 'root',
    password: '1995105',
    database: 'bua_assets',
  });

  try {
    console.log('⚠️  WARNING: This will delete ALL device-related data!\n');
    console.log('📋 The following tables will be cleared:');
    console.log('   1. maintenance_records');
    console.log('   2. maintenance_requests');
    console.log('   3. transfers');
    console.log('   4. depreciation_records');
    console.log('   5. devices');
    console.log('   6. audit_logs (entries related to devices)\n');

    // Get counts before deletion
    const [deviceCount] = await conn.query('SELECT COUNT(*) as count FROM devices');
    const [transferCount] = await conn.query('SELECT COUNT(*) as count FROM transfers');
    const [maintenanceCount] = await conn.query('SELECT COUNT(*) as count FROM maintenance_requests');
    const [historyCount] = await conn.query('SELECT COUNT(*) as count FROM maintenance_records');
    const [depCount] = await conn.query('SELECT COUNT(*) as count FROM depreciation_records');

    console.log('📊 Current data count:');
    console.log(`   Devices: ${(deviceCount as any)[0].count}`);
    console.log(`   Transfers: ${(transferCount as any)[0].count}`);
    console.log(`   Maintenance Requests: ${(maintenanceCount as any)[0].count}`);
    console.log(`   Maintenance History: ${(historyCount as any)[0].count}`);
    console.log(`   Depreciation Records: ${(depCount as any)[0].count}\n`);

    console.log('🗑️  Starting deletion process...\n');

    // Disable foreign key checks temporarily
    await conn.query('SET FOREIGN_KEY_CHECKS=0');

    // Delete in order of dependencies
    console.log('🔄 Deleting maintenance records...');
    const [mh] = await conn.query('DELETE FROM maintenance_records');
    console.log(`✅ Deleted ${(mh as any).affectedRows} records\n`);

    console.log('🔄 Deleting maintenance requests...');
    const [mr] = await conn.query('DELETE FROM maintenance_requests');
    console.log(`✅ Deleted ${(mr as any).affectedRows} records\n`);

    console.log('🔄 Deleting transfers...');
    const [tf] = await conn.query('DELETE FROM transfers');
    console.log(`✅ Deleted ${(tf as any).affectedRows} records\n`);

    console.log('🔄 Deleting depreciation records...');
    const [dr] = await conn.query('DELETE FROM depreciation_records');
    console.log(`✅ Deleted ${(dr as any).affectedRows} records\n`);

    console.log('🔄 Deleting devices...');
    const [dv] = await conn.query('DELETE FROM devices');
    console.log(`✅ Deleted ${(dv as any).affectedRows} records\n`);

    console.log('🔄 Deleting device-related audit logs...');
    const [al] = await conn.query('DELETE FROM audit_logs WHERE entityType IN ("device", "transfer", "maintenance")');
    console.log(`✅ Deleted ${(al as any).affectedRows} records\n`);

    // Re-enable foreign key checks
    await conn.query('SET FOREIGN_KEY_CHECKS=1');

    console.log('✅ All device-related data has been deleted successfully!\n');

    // Verify deletion
    const [finalDeviceCount] = await conn.query('SELECT COUNT(*) as count FROM devices');
    console.log(`📊 Remaining devices: ${(finalDeviceCount as any)[0].count}`);

    await conn.end();
    console.log('\n✅ Deletion completed!');

  } catch (error) {
    console.error('Error:', error);
    await conn.end();
    process.exit(1);
  }
}

deleteAllDeviceData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });

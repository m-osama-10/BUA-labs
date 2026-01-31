import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve('.env') });

async function setupOsaAdmin() {
  try {
    // Parse DATABASE_URL to get connection details
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('❌ DATABASE_URL not found in .env file');
      process.exit(1);
    }

    // Create connection with retry logic
    let conn: mysql.Connection | null = null;
    let retries = 3;
    
    while (retries > 0) {
      try {
        conn = await mysql.createConnection(dbUrl);
        console.log('✅ Connected to database');
        break;
      } catch (err) {
        retries--;
        if (retries > 0) {
          console.log(`⏳ Retrying database connection (${retries} attempts left)...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw err;
        }
      }
    }

    if (!conn) {
      throw new Error('Failed to connect to database after 3 attempts');
    }

    console.log('\n🔧 Setting up BUA Asset Management accounts...\n');

    // 1. Delete existing OSA accounts to start fresh
    console.log('Cleaning up existing accounts...');
    await conn.execute('DELETE FROM users WHERE openId = ?', ['osa-001']);
    console.log('✓ Cleaned up existing OSA account');

    // 2. Create OSA Admin Account
    console.log('\nCreating OSA Admin Account...');
    const [osaTResult] = await conn.execute(
      `INSERT INTO users (openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
      [
        'osa-001',
        'محمد اسامه',  // OSA name in Arabic
        'osa@bua.edu.eg',
        'local',
        'admin'  // Admin role
      ]
    );
    
    const osaId = (osaTResult as any).insertId;
    console.log(`✅ OSA Admin Account created`);
    console.log(`   ID: ${osaId}`);
    console.log(`   Username: Osa`);
    console.log(`   Password: 123`);
    console.log(`   Role: Admin`);
    console.log(`   Name: محمد اسامه`);
    console.log(`   Email: osa@bua.edu.eg`);

    // 3. Create System Admin Account (for backup)
    console.log('\nCreating System Admin Account...');
    const [sysAdminResult] = await conn.execute(
      `INSERT INTO users (openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
      [
        'system-admin-001',
        'نظام الإدارة',  // System Administration in Arabic
        'admin@bua.edu.eg',
        'local',
        'admin'  // Admin role
      ]
    );
    
    const sysAdminId = (sysAdminResult as any).insertId;
    console.log(`✅ System Admin Account created`);
    console.log(`   ID: ${sysAdminId}`);
    console.log(`   Username: admin`);
    console.log(`   Password: admin123`);
    console.log(`   Role: Admin`);
    console.log(`   Name: نظام الإدارة`);

    // 4. Get list of all users
    console.log('\n📋 Current System Users:\n');
    const [users] = await conn.execute(
      `SELECT id, openId, name, email, role, createdAt FROM users ORDER BY id`
    );
    
    (users as any[]).forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || user.openId}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   OpenId: ${user.openId}`);
      console.log('');
    });

    console.log('\n✨ Setup Complete!\n');
    console.log('📝 IMPORTANT INFORMATION:\n');
    console.log('1️⃣  OSA Admin Login Credentials:');
    console.log('   Username: Osa');
    console.log('   Password: 123');
    console.log('   This account has FULL ADMIN privileges');
    console.log('');
    console.log('2️⃣  Features Available to Admin:');
    console.log('   • Create/Edit/Delete devices');
    console.log('   • Manage all transfers and maintenance');
    console.log('   • Create new user accounts');
    console.log('   • Change user roles');
    console.log('   • View complete audit logs');
    console.log('   • Import/Export data');
    console.log('   • View system-wide analytics');
    console.log('');
    console.log('3️⃣  To Create New Accounts:');
    console.log('   • Login as OSA (Osa/123)');
    console.log('   • Navigate to "User Management"');
    console.log('   • Click "Add New User"');
    console.log('   • Fill in the user details and select role');
    console.log('');
    console.log('4️⃣  Available Roles:');
    console.log('   • admin: Full system access');
    console.log('   • unit_manager: Faculty-level management');
    console.log('   • technician: Maintenance personnel');
    console.log('   • user: View-only (QR code scanning)');
    console.log('');

    await conn.end();
  } catch (error) {
    console.error('\n❌ Error during setup:', error);
    process.exit(1);
  }
}

// Run the setup
setupOsaAdmin().catch(console.error);

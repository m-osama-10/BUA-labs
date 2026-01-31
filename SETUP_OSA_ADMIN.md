# 🔐 OSA Admin Account Setup - BUA Asset Management

## Overview

The BUA Asset Management system has been configured with a complete admin account for **OSA** (Mohammad Osama) with full permissions and the ability to create new user accounts.

---

## ✅ Login Credentials

### Primary Admin Account (OSA)
```
Username:                Osa
Password:                123
Full Name:               محمد اسامه
Email:                   osa@bua.edu.eg
Permissions:             Admin (Full Access)
```

### System Admin Account (Backup)
```
Username:                admin
Password:                admin123
Full Name:               نظام الإدارة
Email:                   admin@bua.edu.eg
Permissions:             Admin (Full Access)
```

---

## 🚀 Initial Setup Steps

### 1️⃣ Run Setup Script

```bash
# From project root directory
npm run setup-osa

# Or using pnpm
pnpm setup-osa

# Or directly with tsx/ts-node
npx tsx setup-osa-admin.ts
```

### 2️⃣ Verify Success

After running the script, you should see:
- ✅ OSA Admin account information
- ✅ Created accounts details
- ✅ List of all system users

### 3️⃣ Login to System

1. Open BUA Asset Management application
2. On the login page, you'll see OSA credentials displayed
3. Enter `Osa` and `123`
4. Click "Sign In"

---

## 👥 Adding New User Accounts

### Method 1: Through User Interface (Recommended)

1. **Login** with OSA account
2. **Navigate to**: Sidebar → Users / User Management
3. **Click**: "Add User"
4. **Fill in the form**:
   - Email
   - Full Name
   - Role/Permissions
5. **Click**: "Create"

### Method 2: Via API

```bash
curl -X POST http://localhost:5000/api/trpc/auth.createUser \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-session=YOUR_SESSION" \
  -d '{
    "json": {
      "email": "user@example.com",
      "name": "User Name",
      "role": "unit_manager"
    }
  }'
```

### Method 3: Direct Database

```sql
INSERT INTO users (openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn)
VALUES (
  'local-unique-id',
  'User Name',
  'email@example.com',
  'local',
  'unit_manager',
  NOW(),
  NOW(),
  NOW()
);
```

---

## 🎯 User Roles and Permissions

### 1. Admin 👨‍💼
**Full System Access:**
- ✅ Create, Edit, Delete devices
- ✅ Manage all transfers and maintenance
- ✅ Add and edit users
- ✅ Change user roles
- ✅ View complete audit logs
- ✅ Import/Export data
- ✅ View system-wide analytics

### 2. Unit Manager 🏢
**Faculty-Level Permissions:**
- ✅ Manage devices in assigned faculty
- ✅ Approve transfers and maintenance
- ✅ View faculty-level analytics
- ❌ Cannot add new users

### 3. Technician 🔧
**Maintenance Permissions:**
- ✅ View device list
- ✅ Complete assigned maintenance requests
- ❌ Cannot create new devices
- ❌ Cannot manage transfers

### 4. User 👤
**View-Only Access:**
- ✅ Scan QR codes
- ✅ View device information
- ❌ No admin access

---

## 📝 Required Fields for New Users

```json
{
  "email": "user@bua.edu.eg",      // Unique email
  "name": "User Name",              // Full name
  "role": "unit_manager"            // admin | unit_manager | technician | user
}
```

---

## 🔧 Troubleshooting

### Issue: Login not working

**Solution:**
1. Run the setup script: `npm run setup-osa`
2. Check database connection
3. Verify credentials (Osa/123)

### Issue: Cannot add new users

**Solution:**
1. Verify you're logged in with Admin account
2. Go to Users in sidebar
3. Check your role is "admin" (check profile)

### Issue: Forgot account credentials

**Solution:**
1. Run setup script again: `npm run setup-osa`
2. It will reset OSA and System Admin accounts

---

## 📊 View All Users

```bash
# List all users from system
npm run list-users

# Or from database
mysql> SELECT id, name, email, role, createdAt FROM users ORDER BY id;
```

---

## 🔐 Security Tips

1. **Change default passwords** after first login
2. **Don't share credentials** except with admins
3. **Use unique email** for each account
4. **Review audit logs** regularly
5. **Disable unused accounts** promptly

---

## 📚 Important Links

- **Dashboard**: `/dashboard`
- **User Management**: `/users`
- **Device Management**: `/devices`
- **Audit Logs**: `/audit`
- **Settings**: `/settings`

---

## ✨ Key Features

- ✅ Unlimited user accounts can be created
- ✅ Role-based access control
- ✅ Complete audit trail
- ✅ Real-time user management
- ✅ Secure credential storage
- ✅ Session management

---

## 📞 Support

If you encounter issues:

1. Check application console logs
2. Verify database connectivity
3. Contact technical support team

---

**Last Updated**: January 31, 2026
**Version**: 1.0
**Status**: ✅ Ready for Use

<<<<<<< HEAD
# BUA Smart Unit for Lab Equipment Management

A comprehensive web-based Asset Management System for Badr University in Assiut, designed to track, manage, and maintain laboratory equipment across faculties, departments, and laboratories.

## 🎯 System Overview

The BUA Asset Management System provides complete lifecycle management of university laboratory equipment with features including:

- **Device Tracking:** Immutable device IDs with complete audit trails
- **QR Code System:** Public read-only device pages with immutable QR codes
- **Transfer Management:** Complete history of device location changes
- **Maintenance Scheduling:** Periodic and emergency maintenance tracking
- **Depreciation Calculation:** Automatic straight-line depreciation analysis
- **Excel Integration:** Bulk import/export of devices, transfers, and maintenance
- **Role-Based Access:** Four distinct user roles with granular permissions
- **Dashboard Analytics:** KPIs, charts, and end-of-life alerts
- **LLM Reporting:** Natural language query interface for insights
- **Email Notifications:** Automated alerts for maintenance and approvals
- **Audit Trails:** Complete logging of all system changes

## 📋 Key Features

### Device Management
- Create devices with auto-generated immutable Device IDs
- Track device category, location, purchase information, and status
- Maintain complete device lifecycle from acquisition to depreciation
- Support for devices across multiple faculties, departments, and laboratories

### QR Code System
- Each device receives a unique, immutable QR code upon creation
- Public read-only device pages accessible via QR scanning
- Dynamic content updates without changing QR code URL
- Perfect for mobile access and device lookup

### Transfer Tracking
- Record every device transfer between locations
- Maintain complete transfer history with approvals
- Auto-detect current device location from latest transfer
- Full audit trail of all movements

### Maintenance Management
- Create and track maintenance requests (periodic and emergency)
- Assign technicians and schedule maintenance activities
- Record maintenance costs and completion details
- Maintain complete maintenance history per device

### Depreciation Analysis
- Automatic straight-line depreciation calculation
- Track original price, annual depreciation, and current book value
- Identify devices approaching end-of-life
- Generate depreciation reports and trends

### Excel Integration
- Import bulk devices, transfers, and maintenance records
- Validate data structure before import
- Export devices list, transfer history, and maintenance records
- Full error reporting for failed imports

### Role-Based Access Control
- **Admin:** Full system access
- **Unit Manager:** Faculty-level management and approvals
- **Technician:** Maintenance execution and tracking
- **Normal User:** View-only access via QR codes

### Dashboard & Analytics
- Real-time KPIs and device statistics
- Device status breakdown (working, maintenance, out of service)
- Pending maintenance alerts
- End-of-life device warnings
- Customizable reports and insights

## 🏗️ System Architecture

### Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 19 + Tailwind CSS 4 + Vite |
| Backend | Express.js + tRPC 11 + Node.js |
| Database | MySQL/TiDB |
| Authentication | Manus OAuth 2.0 |
| Storage | S3 for files and QR codes |
| API | tRPC with end-to-end type safety |
| Notifications | Manus Notification API |
| LLM | Manus LLM API |

### Database Schema

The system uses 12 core tables:

1. **users** - Authentication and role management
2. **faculties** - University faculties
3. **departments** - Faculty departments
4. **laboratories** - Department laboratories
5. **devices** - Core asset table with immutable Device IDs
6. **transfers** - Immutable transfer history
7. **maintenance_requests** - Maintenance workflow
8. **maintenance_history** - Immutable maintenance records
9. **depreciation_records** - Depreciation calculations
10. **audit_logs** - Complete change audit trail
11. **import_logs** - Excel import tracking
12. **notification_preferences** - User notification settings

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed schema design.

## 🚀 Getting Started

### Prerequisites

- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL/TiDB database
- Manus OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bua-asset-management
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Configure database connection string
   - Add Manus OAuth credentials

4. **Initialize database**
   ```bash
   pnpm db:push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Access the application**
   - Open http://localhost:3000 in your browser
   - Sign in with Manus OAuth credentials

### Production Build

```bash
pnpm build
pnpm start
```

## 📚 Documentation

- **[USER_GUIDE.md](./USER_GUIDE.md)** - Complete user manual for all roles
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - tRPC API reference
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design and database schema
- **[EXCEL_TEMPLATES.md](./EXCEL_TEMPLATES.md)** - Excel import/export templates

## 👥 User Roles

### Admin
- Full system access
- Create and manage devices
- Approve transfers and maintenance
- View all analytics and audit logs
- Manage user roles

### Unit Manager
- Faculty-level management
- Create devices within faculty
- Approve transfers and maintenance requests
- View faculty analytics
- Assign technicians

### Technician
- Execute assigned maintenance
- View device information
- Complete maintenance records
- View personal assignments

### Normal User
- View-only access via QR codes
- Access public device pages
- No system administration

## 🔐 Security

- OAuth 2.0 authentication via Manus
- Role-based access control (RBAC)
- Immutable audit trails for all changes
- Encrypted data in transit (HTTPS)
- SQL injection prevention via parameterized queries
- XSS protection through React escaping
- CSRF protection via SameSite cookies

## 📊 API Structure

The system uses **tRPC** for all backend communication:

- **devices** - Device CRUD and queries
- **transfers** - Transfer management
- **maintenance** - Maintenance requests and history
- **hierarchy** - Faculty/Department/Laboratory structure
- **depreciation** - Depreciation calculations
- **dashboard** - Analytics and KPIs
- **audit** - Audit log queries

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## 🧪 Testing

Run the test suite:

```bash
pnpm test
```

Tests are located in `server/*.test.ts` files using Vitest.

## 📝 Development Workflow

1. **Update schema** in `drizzle/schema.ts`
2. **Run migrations** with `pnpm db:push`
3. **Add database helpers** in `server/db.ts`
4. **Create procedures** in `server/routers.ts`
5. **Build UI components** in `client/src/pages/`
6. **Write tests** in `server/*.test.ts`
7. **Run `pnpm check`** to verify TypeScript

## 🐛 Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL environment variable
- Check MySQL/TiDB service is running
- Ensure credentials are correct

### OAuth Login Fails
- Verify Manus OAuth credentials
- Check VITE_OAUTH_PORTAL_URL is correct
- Clear browser cookies and try again

### QR Code Not Working
- Ensure device exists in system
- Check QR code token is correct
- Verify public endpoint is accessible

### Excel Import Fails
- Check file format is `.xlsx`
- Verify data matches template structure
- Check for required fields
- Review error report for specific issues

## 📞 Support

For technical issues or feature requests:

1. Check the documentation files
2. Review the troubleshooting section
3. Contact your system administrator
4. Submit a support ticket

## 📄 License

This project is proprietary software for Badr University in Assiut.

## 🙏 Acknowledgments

Built with:
- React and Tailwind CSS for modern UI
- tRPC for type-safe APIs
- Drizzle ORM for database management
- Manus platform for hosting and services

## 📅 Version History

### Version 1.0 (January 26, 2026)
- Initial release
- Core device management
- Transfer and maintenance tracking
- QR code system
- Excel import/export
- Role-based access control
- Dashboard and analytics

---

**System Name:** BUA Smart Unit for Lab Equipment Management  
**Institution:** Badr University in Assiut  
**Version:** 1.0  
**Last Updated:** January 26, 2026

For more information, see the [ARCHITECTURE.md](./ARCHITECTURE.md) file for detailed system design.
=======
# BUA-labs
BUA Asset Management Smart Unit for Lab Equipment Management
>>>>>>> b55a813aebeb31cf99e2c0407128fa848e30547e

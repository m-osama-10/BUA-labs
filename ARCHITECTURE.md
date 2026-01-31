# BUA Smart Unit for Lab Equipment Management - System Architecture

## Executive Summary

The BUA Asset Management System is a comprehensive web-based platform designed for Badr University in Assiut to manage laboratory equipment across faculties, departments, and laboratories. The system provides role-based access control, device tracking with QR codes, transfer history management, maintenance scheduling, automatic depreciation calculation, and advanced reporting capabilities through Excel integration and LLM-powered analytics.

---

## System Overview

### Core Hierarchy
```
University (Badr University - Assiut)
├── Faculty (Engineering, Science, Medicine, etc.)
│   ├── Department (Civil, Electrical, etc.)
│   │   └── Laboratory (Lab A, Lab B, etc.)
│   │       └── Device (Equipment instances)
```

### Key Entities

| Entity | Purpose | Immutability |
|--------|---------|--------------|
| **Device** | Physical equipment with unique identifier | Device ID is immutable |
| **Transfer** | Location/ownership change record | Immutable audit trail |
| **Maintenance** | Service and repair activities | Immutable historical record |
| **QR Code** | Public access point to device information | URL remains constant |
| **Depreciation** | Asset value tracking over time | Calculated automatically |

---

## Database Schema Design

### Table Structure

#### 1. **users** (Authentication & Authorization)
```sql
- id (INT, PK, AUTO_INCREMENT)
- openId (VARCHAR, UNIQUE) - Manus OAuth identifier
- name (TEXT)
- email (VARCHAR)
- role (ENUM: admin, unit_manager, technician, user)
- faculty_id (INT, FK) - For unit managers/technicians
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
- lastSignedIn (TIMESTAMP)
```

#### 2. **faculties**
```sql
- id (INT, PK, AUTO_INCREMENT)
- name (VARCHAR) - e.g., "Engineering", "Science"
- code (VARCHAR, UNIQUE) - e.g., "ENG", "SCI"
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

#### 3. **departments**
```sql
- id (INT, PK, AUTO_INCREMENT)
- faculty_id (INT, FK)
- name (VARCHAR) - e.g., "Civil Engineering"
- code (VARCHAR, UNIQUE) - e.g., "CIVIL"
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

#### 4. **laboratories**
```sql
- id (INT, PK, AUTO_INCREMENT)
- department_id (INT, FK)
- name (VARCHAR) - e.g., "Lab A - Materials Testing"
- code (VARCHAR, UNIQUE) - e.g., "LAB-A-001"
- location (TEXT) - Building and room number
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

#### 5. **devices** (Core Asset Table)
```sql
- id (INT, PK, AUTO_INCREMENT)
- device_id (VARCHAR, UNIQUE, IMMUTABLE) - e.g., "DEV-ENG-2024-001"
- name (VARCHAR) - Device name
- category (VARCHAR) - e.g., "Microscope", "Spectrometer"
- current_laboratory_id (INT, FK) - Current location
- current_faculty_id (INT, FK) - Denormalized for quick access
- current_department_id (INT, FK) - Denormalized for quick access
- purchase_date (DATE)
- purchase_price (DECIMAL(12,2))
- expected_lifetime_years (INT)
- current_status (ENUM: working, under_maintenance, out_of_service)
- notes (TEXT)
- qr_code_token (VARCHAR, UNIQUE) - Immutable token for QR URL
- created_by (INT, FK) - User who created the device
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

#### 6. **transfers** (Audit Trail)
```sql
- id (INT, PK, AUTO_INCREMENT)
- device_id (INT, FK)
- from_laboratory_id (INT, FK)
- to_laboratory_id (INT, FK)
- from_faculty_id (INT, FK)
- to_faculty_id (INT, FK)
- transfer_date (TIMESTAMP)
- reason (TEXT) - e.g., "Relocation", "Loan"
- approved_by (INT, FK) - User who approved
- approval_date (TIMESTAMP)
- notes (TEXT)
- created_by (INT, FK)
- createdAt (TIMESTAMP)
```

#### 7. **maintenance_requests**
```sql
- id (INT, PK, AUTO_INCREMENT)
- device_id (INT, FK)
- maintenance_type (ENUM: periodic, emergency)
- status (ENUM: requested, approved, in_progress, completed, cancelled)
- requested_by (INT, FK)
- assigned_to (INT, FK) - Technician
- scheduled_date (TIMESTAMP)
- completed_date (TIMESTAMP)
- cost (DECIMAL(12,2))
- notes (TEXT)
- created_by (INT, FK)
- createdAt (TIMESTAMP)
- updatedAt (TIMESTAMP)
```

#### 8. **maintenance_history** (Immutable Record)
```sql
- id (INT, PK, AUTO_INCREMENT)
- device_id (INT, FK)
- maintenance_request_id (INT, FK)
- maintenance_type (ENUM: periodic, emergency)
- technician_name (VARCHAR)
- technician_id (INT, FK)
- maintenance_date (DATE)
- cost (DECIMAL(12,2))
- notes (TEXT)
- created_by (INT, FK)
- createdAt (TIMESTAMP)
```

#### 9. **depreciation_records** (Calculated History)
```sql
- id (INT, PK, AUTO_INCREMENT)
- device_id (INT, FK)
- original_price (DECIMAL(12,2))
- expected_lifetime_years (INT)
- annual_depreciation (DECIMAL(12,2))
- calculation_date (DATE)
- current_book_value (DECIMAL(12,2))
- depreciation_percentage (DECIMAL(5,2))
- createdAt (TIMESTAMP)
```

#### 10. **audit_logs** (Complete Audit Trail)
```sql
- id (INT, PK, AUTO_INCREMENT)
- entity_type (VARCHAR) - e.g., "device", "transfer", "maintenance"
- entity_id (INT)
- action (VARCHAR) - e.g., "create", "update", "delete"
- user_id (INT, FK)
- old_values (JSON)
- new_values (JSON)
- ip_address (VARCHAR)
- createdAt (TIMESTAMP)
```

#### 11. **import_logs** (Excel Import Tracking)
```sql
- id (INT, PK, AUTO_INCREMENT)
- import_type (ENUM: devices, transfers, maintenance)
- file_name (VARCHAR)
- total_records (INT)
- successful_records (INT)
- failed_records (INT)
- errors (JSON)
- imported_by (INT, FK)
- createdAt (TIMESTAMP)
```

---

## Role-Based Access Control (RBAC)

### Permission Matrix

| Feature | Admin | Unit Manager | Technician | Normal User |
|---------|-------|--------------|------------|------------|
| **Device Management** | Create, Read, Update, Delete | Read, Approve transfers | Read | Read (via QR) |
| **Transfers** | Full control | Approve/Reject | View | View (via QR) |
| **Maintenance** | Full control | Approve requests | Create, Update | View (via QR) |
| **Excel Import** | Full access | Limited (own faculty) | None | None |
| **Excel Export** | Full access | Limited (own faculty) | Limited (own devices) | None |
| **Dashboard** | Full analytics | Faculty-level analytics | Personal assignments | None |
| **Depreciation** | View all | View own faculty | None | None |
| **Audit Logs** | View all | View own faculty | View own assignments | None |

---

## QR Code System Architecture

### QR Code Generation & Storage

1. **Immutable Token Generation**
   - When a device is created, generate a unique, immutable token (UUID v4)
   - Store token in `devices.qr_code_token`
   - Token never changes, even if device data is updated

2. **QR Code URL Structure**
   ```
   https://bua-asset.manus.space/device/{qr_code_token}
   ```
   - Public endpoint that requires no authentication
   - Returns read-only device information
   - Updates dynamically as device data changes

3. **QR Code Generation Process**
   - Use `qrcode` npm package to generate QR codes
   - Generate on-demand or pre-generate during device creation
   - Store as PNG/SVG in S3 for efficient delivery
   - Cache QR codes with device data

### Public Device Page

- **Route:** `/device/{qr_code_token}`
- **Access:** Public (no authentication required)
- **Content:**
  - Device ID, Name, Category
  - Current Location (Faculty → Department → Laboratory)
  - Current Status
  - Purchase Date & Price
  - Expected Lifetime
  - Current Book Value (calculated depreciation)
  - Last Transfer Date
  - Last Maintenance Date
  - Notes

---

## Depreciation Calculation

### Straight-Line Depreciation Formula

```
Annual Depreciation = (Purchase Price - Salvage Value) / Expected Lifetime (years)
Current Book Value = Purchase Price - (Annual Depreciation × Years Elapsed)
Depreciation Percentage = (Annual Depreciation / Purchase Price) × 100
```

### Implementation Details

- **Calculation Trigger:** On device creation and annually thereafter
- **Storage:** `depreciation_records` table maintains historical snapshots
- **Display:** Show original price, annual depreciation, current book value
- **Alerts:** Flag devices approaching end-of-life (book value < 5% of original)

---

## Transfer Module

### Transfer Workflow

1. **Request Creation**
   - User initiates transfer with from/to locations
   - Includes reason and notes
   - Status: `pending_approval`

2. **Approval Process**
   - Unit Manager reviews and approves/rejects
   - System records approval timestamp and approver ID
   - Status: `approved` or `rejected`

3. **Execution**
   - Transfer is recorded in `transfers` table
   - Device's current location is updated
   - Status: `completed`

4. **History Tracking**
   - All transfers are immutable records
   - Current location is derived from the most recent transfer
   - Full transfer history is queryable

---

## Maintenance Module

### Maintenance Request Workflow

1. **Request Submission**
   - User creates maintenance request for a device
   - Specifies type (periodic/emergency) and notes
   - Status: `requested`

2. **Approval**
   - Unit Manager approves/rejects
   - Assigns to a technician
   - Status: `approved` or `rejected`

3. **Execution**
   - Technician updates status to `in_progress`
   - Records maintenance details
   - Status: `completed`

4. **Record Creation**
   - Maintenance history is recorded in `maintenance_history`
   - Immutable record for auditing
   - Includes cost, technician name, date, notes

### Maintenance Scheduling

- **Periodic Maintenance:** Scheduled based on device type and frequency
- **Emergency Maintenance:** Triggered by device failure or urgent need
- **Notifications:** Email alerts to Unit Managers and Technicians

---

## Excel Import/Export

### Import Functionality

#### Devices Import
```
Columns: Device ID, Name, Category, Faculty, Department, Laboratory, 
         Purchase Date, Purchase Price, Expected Lifetime (years), 
         Current Status, Notes
```

#### Transfers Import
```
Columns: Device ID, From Faculty, From Department, From Laboratory,
         To Faculty, To Department, To Laboratory, Transfer Date, 
         Reason, Approved By, Notes
```

#### Maintenance Import
```
Columns: Device ID, Maintenance Type, Technician Name, Maintenance Date,
         Cost, Notes
```

### Import Validation

- Check for required fields
- Validate device IDs exist
- Verify faculty/department/laboratory hierarchy
- Check date formats
- Validate numeric fields (prices, costs)
- Generate error report for failed records

### Export Functionality

- Export devices list with current status and location
- Export transfer history with full audit trail
- Export maintenance history with costs and technician details
- Format: Excel (.xlsx) with multiple sheets
- Include summary statistics and charts

---

## Email Notification System

### Notification Triggers

| Event | Recipients | Content |
|-------|------------|---------|
| Periodic Maintenance Due | Unit Manager, Technician | Device name, scheduled date, maintenance type |
| Maintenance Request Submitted | Unit Manager | Device name, requester, maintenance type |
| Maintenance Approved | Technician | Device name, scheduled date, assignment details |
| Transfer Approved | Requester | Device name, new location, approval date |
| Device End-of-Life Alert | Unit Manager, Admin | Device name, book value, recommended action |

### Email Configuration

- Use Manus built-in notification API
- Template-based email generation
- Batch processing for scheduled notifications
- Retry mechanism for failed sends

---

## LLM Integration

### Report Generation

1. **Asset Summary Report**
   - Total devices by status, faculty, department
   - Average device age and remaining lifetime
   - Total asset value and depreciation trends

2. **Depreciation Analysis**
   - Devices approaching end-of-life
   - Depreciation trends by category
   - Replacement recommendations

3. **Maintenance Insights**
   - Most frequently maintained devices
   - Maintenance cost trends
   - Technician performance metrics

### Natural Language Query Interface

- Allow users to ask questions about assets
- LLM generates SQL queries and summarizes results
- Examples:
  - "Which devices in the Engineering faculty are out of service?"
  - "What's the total depreciation for microscopes this year?"
  - "Show me devices that need maintenance in the next 30 days"

---

## API Structure (tRPC Procedures)

### Device Router
- `devices.list` - Get devices with filters
- `devices.create` - Create new device
- `devices.getById` - Get device details
- `devices.update` - Update device (non-ID fields)
- `devices.delete` - Soft delete device
- `devices.getPublic` - Get public device info by QR token

### Transfer Router
- `transfers.list` - Get transfer history
- `transfers.create` - Create transfer request
- `transfers.approve` - Approve transfer
- `transfers.reject` - Reject transfer
- `transfers.getHistory` - Get device transfer history

### Maintenance Router
- `maintenance.list` - Get maintenance requests
- `maintenance.create` - Create maintenance request
- `maintenance.approve` - Approve maintenance
- `maintenance.complete` - Complete maintenance
- `maintenance.getHistory` - Get device maintenance history

### Import/Export Router
- `import.devices` - Import devices from Excel
- `import.transfers` - Import transfers from Excel
- `import.maintenance` - Import maintenance records
- `export.devices` - Export devices list
- `export.transfers` - Export transfer history
- `export.maintenance` - Export maintenance history

### Dashboard Router
- `dashboard.stats` - Get KPI statistics
- `dashboard.devicesByStatus` - Devices grouped by status
- `dashboard.devicesByFaculty` - Devices grouped by faculty
- `dashboard.maintenanceAlerts` - Upcoming maintenance
- `dashboard.endOfLifeAlerts` - Devices near end-of-life

### Reporting Router
- `reporting.generateReport` - Generate asset report via LLM
- `reporting.queryAssets` - Natural language asset query

---

## Frontend Architecture

### Page Structure

```
/
├── /dashboard - Admin/Manager dashboard
├── /devices - Device list and management
│   └── /devices/:id - Device details
├── /transfers - Transfer management
├── /maintenance - Maintenance management
├── /import - Excel import interface
├── /export - Excel export interface
├── /reports - LLM-powered reporting
├── /device/:qr_code_token - Public QR device page
└── /profile - User profile and settings
```

### Component Organization

```
components/
├── Dashboard/
│   ├── KPICards.tsx
│   ├── DeviceChart.tsx
│   └── AlertsList.tsx
├── Device/
│   ├── DeviceList.tsx
│   ├── DeviceForm.tsx
│   └── DeviceDetail.tsx
├── Transfer/
│   ├── TransferList.tsx
│   └── TransferForm.tsx
├── Maintenance/
│   ├── MaintenanceList.tsx
│   └── MaintenanceForm.tsx
├── Import/
│   ├── FileUpload.tsx
│   └── ImportPreview.tsx
├── Export/
│   └── ExportOptions.tsx
└── Common/
    ├── Navigation.tsx
    ├── Filters.tsx
    └── QRScanner.tsx
```

---

## Security Considerations

### Authentication & Authorization
- OAuth 2.0 via Manus for user authentication
- Role-based access control enforced at API level
- Session management with secure cookies

### Data Protection
- All sensitive data encrypted in transit (HTTPS)
- Device IDs and QR tokens immutable and unique
- Audit logs for all data modifications
- Soft deletes for data retention

### Input Validation
- Server-side validation for all inputs
- SQL injection prevention via parameterized queries
- XSS prevention through React's built-in escaping
- CSRF protection via SameSite cookies

---

## Performance Considerations

### Database Optimization
- Indexes on frequently queried fields (device_id, qr_code_token, status)
- Denormalized current location fields for fast queries
- Pagination for large result sets
- Connection pooling for database efficiency

### Caching Strategy
- Cache device list and hierarchy (5-minute TTL)
- Cache QR code images in S3
- Cache dashboard statistics (1-minute TTL)
- Invalidate cache on data modifications

### Frontend Optimization
- Lazy loading for device lists
- Code splitting for different user roles
- Image optimization for QR codes
- Efficient state management with tRPC

---

## Deployment Architecture

### Technology Stack
- **Frontend:** React 19 + Tailwind CSS 4 + Vite
- **Backend:** Express.js + tRPC + Node.js
- **Database:** MySQL/TiDB
- **Storage:** S3 for files and QR code images
- **Authentication:** Manus OAuth
- **Email:** Manus Notification API
- **LLM:** Manus LLM API

### Infrastructure
- **Hosting:** Manus platform
- **Database:** Managed MySQL/TiDB
- **Storage:** S3 bucket
- **CDN:** Manus CDN for static assets
- **Monitoring:** Application logs and error tracking

---

## Audit & Compliance

### Audit Trail
- All device modifications logged with user, timestamp, and changes
- All transfers recorded immutably with approval chain
- All maintenance activities tracked with technician and cost
- All imports logged with success/failure details

### Data Retention
- Device records retained indefinitely
- Transfer history retained indefinitely
- Maintenance history retained indefinitely
- Audit logs retained for 7 years (compliance requirement)

---

## Future Enhancements

1. **Mobile App:** Native iOS/Android app for QR scanning and device lookup
2. **Barcode Support:** Add barcode scanning alongside QR codes
3. **Integration:** Connect with university procurement system
4. **Predictive Maintenance:** Use ML to predict device failures
5. **IoT Integration:** Connect with device sensors for real-time monitoring
6. **Multi-Language Support:** Localization for Arabic and English
7. **Advanced Analytics:** Predictive depreciation and replacement planning

---

## Conclusion

The BUA Asset Management System provides a comprehensive, scalable solution for managing laboratory equipment across the university. With robust role-based access control, immutable audit trails, and advanced reporting capabilities, the system ensures accountability, efficiency, and data integrity in asset management operations.

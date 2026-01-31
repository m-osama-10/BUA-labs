# BUA Asset Management System - User Guide

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [User Roles and Permissions](#user-roles-and-permissions)
4. [Device Management](#device-management)
5. [Transfer Management](#transfer-management)
6. [Maintenance Management](#maintenance-management)
7. [QR Code System](#qr-code-system)
8. [Excel Import/Export](#excel-importexport)
9. [Dashboard and Reports](#dashboard-and-reports)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The BUA Asset Management System is a comprehensive platform for managing laboratory equipment across Badr University in Assiut. The system tracks devices through their entire lifecycle, from acquisition to depreciation, while maintaining complete audit trails of all changes.

### Key Capabilities

- **Device Tracking:** Immutable device IDs with complete lifecycle tracking
- **QR Code Access:** Public read-only device pages accessible via QR code
- **Transfer History:** Complete record of all device movements between locations
- **Maintenance Scheduling:** Periodic and emergency maintenance management
- **Depreciation Calculation:** Automatic straight-line depreciation tracking
- **Excel Integration:** Bulk import and export of devices, transfers, and maintenance records
- **Role-Based Access:** Four distinct user roles with granular permissions
- **Audit Trails:** Complete logging of all system changes

---

## Getting Started

### Logging In

1. Navigate to the BUA Asset Management System homepage
2. Click the **Sign In** button
3. Enter your Manus credentials
4. You will be redirected to the dashboard

### Dashboard Overview

Upon login, you will see the main dashboard displaying:

- **Total Devices:** Overall count of all equipment in the system
- **Device Status Summary:** Breakdown by working, under maintenance, and out of service
- **Pending Maintenance:** List of maintenance requests awaiting approval
- **End-of-Life Alerts:** Devices approaching the end of their expected lifetime

---

## User Roles and Permissions

### Admin

**Full system access with complete control over all features.**

| Feature | Permission |
|---------|-----------|
| Device Management | Create, Read, Update, Delete |
| Transfers | Full control - Create, Approve, View history |
| Maintenance | Full control - Create, Approve, Complete |
| Excel Operations | Import and export all data |
| Dashboard | View all analytics and KPIs |
| Audit Logs | View complete audit trail |
| User Management | Promote/demote users to different roles |

### Unit Manager

**Manages devices and approvals within their assigned faculty.**

| Feature | Permission |
|---------|-----------|
| Device Management | Read all, Create/Update within faculty |
| Transfers | Create requests, Approve transfers |
| Maintenance | Create requests, Approve assignments |
| Excel Operations | Import/Export within faculty scope |
| Dashboard | View faculty-level analytics |
| Audit Logs | View faculty-level changes |

### Technician

**Performs maintenance activities on assigned devices.**

| Feature | Permission |
|---------|-----------|
| Device Management | Read only |
| Transfers | View only |
| Maintenance | View assigned requests, Complete maintenance |
| Excel Operations | None |
| Dashboard | View personal assignments |
| Audit Logs | View own activities |

### Normal User

**View-only access via QR code scanning.**

| Feature | Permission |
|---------|-----------|
| Device Information | Read via QR code public page |
| Other Features | No access |

---

## Device Management

### Creating a Device

**Only Admins can create new devices.**

1. Navigate to **Devices** → **Add Device**
2. Fill in the following information:
   - **Device Name:** Descriptive name (e.g., "Electron Microscope A")
   - **Category:** Equipment type (e.g., "Microscope", "Spectrometer")
   - **Faculty:** Select the faculty where the device is located
   - **Department:** Select the department
   - **Laboratory:** Select the specific laboratory
   - **Purchase Date:** Date of acquisition
   - **Purchase Price:** Original cost in currency
   - **Expected Lifetime:** Number of years before end-of-life
   - **Notes:** Any additional information

3. Click **Create Device**
4. The system will generate:
   - Unique immutable **Device ID** (format: DEV-FACULTY-YEAR-NUMBER)
   - Unique immutable **QR Code Token**
   - Initial depreciation record

### Viewing Device Details

1. Navigate to **Devices**
2. Click on a device to view:
   - Current status and location
   - Purchase information
   - Current depreciation value
   - Transfer history
   - Maintenance history
   - QR code for public access

### Updating Device Information

1. Open the device details page
2. Click **Edit**
3. Modify allowed fields:
   - Device Name
   - Category
   - Current Status (working, under maintenance, out of service)
   - Notes

**Note:** Device ID, QR Code Token, and purchase information are immutable.

### Device Status

Devices can have three statuses:

- **Working:** Device is operational and available for use
- **Under Maintenance:** Device is currently being serviced
- **Out of Service:** Device is no longer operational or available

---

## Transfer Management

### Creating a Transfer Request

1. Navigate to **Transfers** → **New Transfer**
2. Select the device to transfer
3. Specify:
   - **From Location:** Current location (auto-filled)
   - **To Location:** New location (Faculty → Department → Laboratory)
   - **Transfer Date:** When the transfer will occur
   - **Reason:** Why the device is being transferred (e.g., "Relocation", "Loan")
   - **Notes:** Additional details

4. Click **Submit Request**
5. The request will be pending Unit Manager approval

### Approving Transfers

**Unit Managers can approve transfer requests.**

1. Navigate to **Transfers** → **Pending Requests**
2. Review the transfer details
3. Click **Approve** or **Reject**
4. If approved, the device's location is automatically updated

### Viewing Transfer History

1. Open a device's details page
2. Scroll to **Transfer History**
3. View all past transfers with dates, locations, and approvers

---

## Maintenance Management

### Creating a Maintenance Request

1. Navigate to **Maintenance** → **New Request**
2. Select the device requiring maintenance
3. Specify:
   - **Maintenance Type:** Periodic (scheduled) or Emergency (urgent)
   - **Scheduled Date:** When maintenance should occur
   - **Notes:** Description of work needed

4. Click **Submit Request**
5. Request is pending Unit Manager approval

### Approving Maintenance Requests

**Unit Managers approve and assign maintenance.**

1. Navigate to **Maintenance** → **Pending Requests**
2. Review the request
3. Click **Approve**
4. Select the **Technician** to assign
5. Confirm the **Scheduled Date**
6. Click **Assign**

### Completing Maintenance

**Technicians complete assigned maintenance.**

1. Navigate to **Maintenance** → **My Assignments**
2. Click on an assigned maintenance request
3. Enter:
   - **Maintenance Date:** When work was completed
   - **Cost:** Amount spent on parts/labor
   - **Notes:** Details of work performed

4. Click **Mark Complete**
5. A permanent maintenance history record is created

### Viewing Maintenance History

1. Open a device's details page
2. Scroll to **Maintenance History**
3. View all completed maintenance with dates, technicians, and costs

---

## QR Code System

### Generating QR Codes

Every device automatically receives a unique QR code upon creation. The QR code is immutable and contains a URL to the device's public information page.

### Accessing Device Information via QR

1. Use a QR code scanner (smartphone camera or dedicated app)
2. Scan the device's QR code
3. You will be directed to the public device page showing:
   - Device ID and name
   - Current location (Faculty → Department → Laboratory)
   - Current status
   - Purchase information
   - Current depreciation value
   - Last transfer date
   - Last maintenance date

### QR Code Permanence

- QR codes never change, even if device information is updated
- The public page dynamically displays current device information
- This ensures QR codes remain valid throughout the device's lifecycle

---

## Excel Import/Export

### Importing Devices

1. Navigate to **Import/Export** → **Import Devices**
2. Prepare an Excel file with columns:
   - Device Name
   - Category
   - Faculty
   - Department
   - Laboratory
   - Purchase Date (YYYY-MM-DD format)
   - Purchase Price
   - Expected Lifetime (years)
   - Notes (optional)

3. Click **Select File** and choose your Excel file
4. Click **Preview** to verify data
5. Click **Import**
6. The system will:
   - Validate all data
   - Generate Device IDs and QR codes
   - Create depreciation records
   - Display success/error report

### Importing Transfers

1. Navigate to **Import/Export** → **Import Transfers**
2. Prepare an Excel file with columns:
   - Device ID
   - From Faculty
   - From Department
   - From Laboratory
   - To Faculty
   - To Department
   - To Laboratory
   - Transfer Date (YYYY-MM-DD format)
   - Reason
   - Notes (optional)

3. Follow the import process
4. All transfers will be recorded with current date as approval date

### Importing Maintenance

1. Navigate to **Import/Export** → **Import Maintenance**
2. Prepare an Excel file with columns:
   - Device ID
   - Maintenance Type (periodic or emergency)
   - Technician Name
   - Maintenance Date (YYYY-MM-DD format)
   - Cost
   - Notes (optional)

3. Follow the import process
4. All records will be added to maintenance history

### Exporting Data

1. Navigate to **Import/Export** → **Export**
2. Select what to export:
   - **Devices List:** All devices with current status and location
   - **Transfer History:** Complete transfer records
   - **Maintenance History:** All maintenance activities

3. Click **Export**
4. An Excel file will be downloaded with the selected data

---

## Dashboard and Reports

### Dashboard Metrics

The admin dashboard displays:

- **Total Devices:** Overall count
- **Device Status Breakdown:** Working, Under Maintenance, Out of Service
- **Pending Maintenance:** Requests awaiting approval
- **End-of-Life Alerts:** Devices with book value < 5% of original price

### Depreciation Analysis

1. Navigate to **Reports** → **Depreciation**
2. View:
   - Original purchase price
   - Annual depreciation amount
   - Current book value
   - Remaining useful life

### Maintenance Insights

1. Navigate to **Reports** → **Maintenance**
2. View:
   - Most frequently maintained devices
   - Maintenance cost trends
   - Technician performance metrics

### LLM-Powered Reports

1. Navigate to **Reports** → **Natural Language Query**
2. Ask questions like:
   - "Which devices in Engineering are out of service?"
   - "What's the total depreciation for microscopes this year?"
   - "Show me devices needing maintenance in the next 30 days"

3. The system will generate a natural language response with data

---

## Audit Logs

### Accessing Audit Logs

**Only Admins can view complete audit logs.**

1. Navigate to **Audit Logs**
2. View all system changes with:
   - Entity type (device, transfer, maintenance)
   - Action performed (create, update, delete, approve)
   - User who made the change
   - Timestamp
   - Old and new values

### Filtering Audit Logs

- Filter by entity type
- Filter by user
- Filter by date range
- Search by entity ID

---

## Troubleshooting

### Cannot Create a Device

**Issue:** "Permission Denied" error

**Solution:** Only Admins can create devices. Contact your system administrator if you need to add a device.

### QR Code Not Working

**Issue:** QR code scanner returns an error

**Solution:** 
- Ensure the device is still in the system (not deleted)
- Try scanning with a different QR code reader
- Check your internet connection

### Transfer Not Updating Device Location

**Issue:** Device location hasn't changed after transfer approval

**Solution:**
- Refresh the page (F5)
- Check that the transfer was actually approved
- Contact your Unit Manager to verify approval

### Maintenance Request Stuck in "Requested" Status

**Issue:** Maintenance request not being approved

**Solution:**
- Notify your Unit Manager about the pending request
- Check if the device information is correct
- Verify the technician is available on the scheduled date

### Excel Import Failing

**Issue:** "Validation Error" during import

**Solution:**
- Verify all required columns are present
- Check date formats (must be YYYY-MM-DD)
- Ensure Device IDs exist (for transfers and maintenance imports)
- Look at the error report for specific issues

### Cannot Access Certain Features

**Issue:** Menu items are grayed out or unavailable

**Solution:**
- Your user role may not have permission for that feature
- Contact your administrator to request access
- Refer to the User Roles section to understand your permissions

---

## Contact and Support

For technical issues or feature requests, please contact your system administrator or submit a support ticket through the system.

---

## Glossary

| Term | Definition |
|------|-----------|
| **Device ID** | Unique immutable identifier for each device (e.g., DEV-ENG-2024-0001) |
| **QR Code Token** | Unique immutable token used to generate QR codes for public access |
| **Transfer** | Record of device movement from one location to another |
| **Maintenance Request** | Request to perform maintenance on a device |
| **Depreciation** | Reduction in asset value over time using straight-line method |
| **Audit Log** | Complete record of all system changes for compliance and tracking |
| **Book Value** | Current asset value after depreciation (Original Price - Total Depreciation) |
| **End-of-Life** | Device has reached the end of its expected useful lifetime |

---

**Last Updated:** January 26, 2026  
**Version:** 1.0  
**System:** BUA Smart Unit for Lab Equipment Management

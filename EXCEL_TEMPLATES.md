# Excel Import Templates

This document provides sample data and templates for importing devices, transfers, and maintenance records into the BUA Asset Management System.

## Devices Import Template

### Column Structure

| Column | Type | Required | Example | Notes |
|--------|------|----------|---------|-------|
| Device Name | Text | Yes | Electron Microscope A | Descriptive name of the equipment |
| Category | Text | Yes | Microscope | Equipment type/category |
| Faculty | Text | Yes | Engineering | Faculty name (must exist in system) |
| Department | Text | Yes | Civil Engineering | Department name (must exist in system) |
| Laboratory | Text | Yes | Lab A - Materials Testing | Laboratory name (must exist in system) |
| Purchase Date | Date | Yes | 2024-01-15 | Format: YYYY-MM-DD |
| Purchase Price | Decimal | Yes | 50000.00 | Original purchase cost |
| Expected Lifetime (years) | Number | Yes | 10 | Expected useful life in years |
| Notes | Text | No | High-resolution imaging | Additional information |

### Sample Data

```
Device Name,Category,Faculty,Department,Laboratory,Purchase Date,Purchase Price,Expected Lifetime (years),Notes
Electron Microscope A,Microscope,Engineering,Civil Engineering,Lab A - Materials Testing,2024-01-15,50000.00,10,High-resolution imaging
UV Spectrometer,Spectrometer,Science,Chemistry,Lab B - Analytical,2023-06-20,25000.00,8,Wavelength range 200-800nm
Tensile Testing Machine,Testing Equipment,Engineering,Mechanical Engineering,Lab C - Materials,2022-03-10,75000.00,15,Capacity: 100kN
pH Meter,Analytical Equipment,Science,Biology,Lab D - Biochemistry,2024-02-01,5000.00,5,Digital display
Centrifuge,Laboratory Equipment,Science,Biology,Lab D - Biochemistry,2023-11-05,12000.00,7,Speed: 15000 RPM
```

---

## Transfers Import Template

### Column Structure

| Column | Type | Required | Example | Notes |
|--------|------|----------|---------|-------|
| Device ID | Text | Yes | DEV-ENG-2024-0001 | Immutable device identifier |
| From Faculty | Text | Yes | Engineering | Current faculty |
| From Department | Text | Yes | Civil Engineering | Current department |
| From Laboratory | Text | Yes | Lab A - Materials Testing | Current laboratory |
| To Faculty | Text | Yes | Engineering | Destination faculty |
| To Department | Text | Yes | Mechanical Engineering | Destination department |
| To Laboratory | Text | Yes | Lab C - Materials | Destination laboratory |
| Transfer Date | Date | Yes | 2024-01-20 | Format: YYYY-MM-DD |
| Reason | Text | No | Relocation | Reason for transfer |
| Notes | Text | No | Moved to new building | Additional details |

### Sample Data

```
Device ID,From Faculty,From Department,From Laboratory,To Faculty,To Department,To Laboratory,Transfer Date,Reason,Notes
DEV-ENG-2024-0001,Engineering,Civil Engineering,Lab A - Materials Testing,Engineering,Mechanical Engineering,Lab C - Materials,2024-01-20,Relocation,Moved to new building
DEV-SCI-2024-0002,Science,Chemistry,Lab B - Analytical,Science,Chemistry,Lab E - Advanced,2024-02-15,Upgrade,Relocated to upgraded facility
DEV-ENG-2024-0003,Engineering,Mechanical Engineering,Lab C - Materials,Engineering,Civil Engineering,Lab A - Materials Testing,2024-03-01,Loan,Temporary transfer for project
```

---

## Maintenance Import Template

### Column Structure

| Column | Type | Required | Example | Notes |
|--------|------|----------|---------|-------|
| Device ID | Text | Yes | DEV-ENG-2024-0001 | Immutable device identifier |
| Maintenance Type | Text | Yes | periodic | Either "periodic" or "emergency" |
| Technician Name | Text | Yes | Ahmed Hassan | Name of technician who performed work |
| Maintenance Date | Date | Yes | 2024-01-25 | Format: YYYY-MM-DD |
| Cost | Decimal | No | 500.00 | Cost of maintenance (optional) |
| Notes | Text | No | Replaced bearings | Description of work performed |

### Sample Data

```
Device ID,Maintenance Type,Technician Name,Maintenance Date,Cost,Notes
DEV-ENG-2024-0001,periodic,Ahmed Hassan,2024-01-25,500.00,Replaced bearings and lubricated joints
DEV-SCI-2024-0002,emergency,Fatima Mohammed,2024-02-10,1200.00,Repaired optical system
DEV-ENG-2024-0003,periodic,Mohamed Ali,2024-03-05,300.00,Calibration and cleaning
DEV-SCI-2024-0004,periodic,Noor Ibrahim,2024-03-15,150.00,Filter replacement
```

---

## Creating Excel Files

### Using Microsoft Excel

1. Open Microsoft Excel
2. Create a new workbook
3. Enter column headers in the first row
4. Enter data starting from row 2
5. Save as `.xlsx` format

### Using Google Sheets

1. Open Google Sheets
2. Create a new spreadsheet
3. Enter column headers and data
4. Download as `.xlsx` format (File → Download → Microsoft Excel)

### Using LibreOffice Calc

1. Open LibreOffice Calc
2. Create a new spreadsheet
3. Enter column headers and data
4. Save as `.xlsx` format

---

## Data Validation Rules

### Devices Import

- **Device Name:** Cannot be empty, max 255 characters
- **Category:** Cannot be empty, max 100 characters
- **Faculty:** Must match an existing faculty in the system
- **Department:** Must match an existing department in the specified faculty
- **Laboratory:** Must match an existing laboratory in the specified department
- **Purchase Date:** Must be in YYYY-MM-DD format and not in the future
- **Purchase Price:** Must be a positive decimal number
- **Expected Lifetime:** Must be a positive integer (minimum 1 year)

### Transfers Import

- **Device ID:** Must match an existing device in the system
- **From/To Faculty:** Must match existing faculties
- **From/To Department:** Must match existing departments
- **From/To Laboratory:** Must match existing laboratories
- **Transfer Date:** Must be in YYYY-MM-DD format
- **Reason:** Optional but recommended (max 255 characters)

### Maintenance Import

- **Device ID:** Must match an existing device in the system
- **Maintenance Type:** Must be either "periodic" or "emergency"
- **Technician Name:** Cannot be empty, max 255 characters
- **Maintenance Date:** Must be in YYYY-MM-DD format
- **Cost:** Must be a positive decimal number (optional)

---

## Import Error Handling

If your import contains errors, the system will:

1. **Validate all records** before importing any data
2. **Display an error report** listing all issues
3. **Prevent partial imports** (all-or-nothing approach)
4. **Provide specific error messages** for each problematic row

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Faculty not found: Engineering" | Faculty name doesn't match | Check exact spelling in system |
| "Invalid date format" | Date not in YYYY-MM-DD | Use correct format (e.g., 2024-01-15) |
| "Device ID not found" | Device doesn't exist | Verify Device ID is correct |
| "Required field missing" | Column is empty | Fill in all required fields |
| "Invalid decimal number" | Price format incorrect | Use format like 1000.00 |

---

## Best Practices

### Before Importing

1. **Verify Data Accuracy:** Double-check all information before importing
2. **Backup Existing Data:** Export current data before large imports
3. **Test with Sample:** Import a small sample first to verify format
4. **Check Hierarchy:** Ensure faculties, departments, and labs exist
5. **Validate Dates:** Use consistent date format (YYYY-MM-DD)

### During Import

1. **Review Preview:** Check the preview before confirming import
2. **Monitor Progress:** Watch for any error messages
3. **Keep File:** Don't delete the original Excel file until import completes

### After Import

1. **Verify Results:** Check that data was imported correctly
2. **Review Audit Logs:** Check audit logs for import details
3. **Update Records:** Make any necessary corrections
4. **Backup:** Export and backup the imported data

---

## Troubleshooting

### Import File Won't Upload

**Issue:** "File format not supported"

**Solution:** 
- Ensure file is saved as `.xlsx` (Excel 2007+)
- Not `.xls` (older Excel format)
- Not `.csv` (use Excel format instead)

### Some Records Imported, Others Failed

**Issue:** "Partial import not allowed"

**Solution:**
- The system uses all-or-nothing validation
- Fix all errors in the error report
- Re-import the corrected file

### Duplicate Device IDs After Import

**Issue:** "Device ID already exists"

**Solution:**
- Device IDs are auto-generated during creation
- Don't manually specify Device IDs for new devices
- For transfers/maintenance, use existing Device IDs

### Date Format Errors

**Issue:** "Invalid date format"

**Solution:**
- Always use YYYY-MM-DD format
- Examples: 2024-01-15, 2024-12-31
- Not: 01/15/2024, 15-01-2024, or other formats

---

## Exporting Data

### Export Formats

The system exports data in `.xlsx` format with multiple sheets:

- **Devices:** All devices with current status and location
- **Transfers:** Complete transfer history
- **Maintenance:** All maintenance records

### Using Exported Data

1. **Backup:** Keep exported files as backups
2. **Analysis:** Use Excel for further analysis and reporting
3. **Re-import:** Can re-import exported data to another system
4. **Sharing:** Share reports with stakeholders

---

## Support

For issues with Excel import/export:

1. Check the error report for specific issues
2. Verify data format matches the template
3. Contact your system administrator
4. Provide the problematic Excel file for analysis

---

**Last Updated:** January 26, 2026  
**Version:** 1.0  
**System:** BUA Smart Unit for Lab Equipment Management

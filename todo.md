# BUA Asset Management System - TODO

## Phase 1: Database & Backend Setup
- [x] Design and implement database schema with all tables
- [x] Set up database migrations using Drizzle ORM
- [x] Create database helper functions in server/db.ts
- [x] Implement audit logging system
- [x] Set up role-based access control middleware

## Phase 2: Authentication & Authorization
- [x] Extend user roles (admin, unit_manager, technician, user)
- [x] Add faculty_id field to users table for role filtering
- [x] Implement protectedProcedure with role checking
- [x] Create adminProcedure and unitManagerProcedure helpers
- [x] Add role-based route protection in frontend

## Phase 3: Device Management
- [ ] Create devices table and schema
- [ ] Implement device CRUD procedures
- [ ] Generate immutable Device IDs (format: DEV-FACULTY-YEAR-NUMBER)
- [ ] Implement QR code generation and storage
- [ ] Create public device page route (/device/:qr_code_token)
- [ ] Add device list with filters (faculty, department, lab, status)
- [ ] Implement device detail page
- [ ] Add device form for creation and editing
- [ ] Create depreciation calculation logic
- [ ] Store depreciation records in database

## Phase 4: Transfer Module
- [ ] Create transfers table and schema
- [ ] Implement transfer request creation
- [ ] Build transfer approval workflow
- [ ] Auto-detect current location from latest transfer
- [ ] Create transfer history view
- [ ] Implement transfer list with filters
- [ ] Add transfer form and approval interface
- [ ] Create audit trail for transfers

## Phase 5: Maintenance Module
- [ ] Create maintenance_requests and maintenance_history tables
- [ ] Implement maintenance request creation
- [ ] Build maintenance approval workflow
- [ ] Create maintenance completion process
- [ ] Implement maintenance history view
- [ ] Add maintenance list with filters
- [ ] Create maintenance form
- [ ] Add technician assignment interface

## Phase 6: Excel Import/Export
- [ ] Create Excel import procedures for devices - Backend ready, UI pending
- [ ] Create Excel import procedures for transfers - Backend ready, UI pending
- [ ] Create Excel import procedures for maintenance - Backend ready, UI pending
- [ ] Implement import validation logic - Backend ready
- [ ] Build import error reporting - UI pending
- [ ] Create Excel export for devices list - Backend ready, UI pending
- [ ] Create Excel export for transfer history - Backend ready, UI pending
- [ ] Create Excel export for maintenance history - Backend ready, UI pending
- [ ] Build import/export UI components - UI pending
- [x] Create sample Excel templates

## Phase 7: Email Notifications
- [ ] Set up email notification configuration
- [ ] Create email templates for all notification types
- [ ] Implement periodic maintenance due notifications
- [ ] Implement maintenance request submitted notifications
- [ ] Implement maintenance approved notifications
- [ ] Implement transfer approved notifications
- [ ] Implement end-of-life device alerts
- [ ] Create notification scheduling system
- [ ] Add email notification preferences to user settings

## Phase 8: LLM Integration
- [ ] Integrate LLM API for report generation
- [ ] Implement asset summary report generation
- [ ] Implement depreciation analysis report
- [ ] Implement maintenance insights report
- [ ] Create natural language query interface
- [ ] Build report display components
- [ ] Add query history tracking

## Phase 9: Admin Dashboard
- [ ] Create dashboard layout
- [ ] Implement KPI cards (total devices, by status, by faculty)
- [ ] Build device status chart
- [ ] Build devices by faculty chart
- [ ] Build maintenance alerts list
- [ ] Build end-of-life alerts list
- [ ] Implement recent activity feed
- [ ] Add dashboard filters and date range selection

## Phase 10: User Interfaces
- [ ] Build responsive navigation/sidebar
- [ ] Create device list page with filters
- [ ] Create device detail page
- [ ] Create device form (create/edit)
- [ ] Build transfer list page
- [ ] Create transfer form and approval interface
- [ ] Build maintenance list page
- [ ] Create maintenance form and approval interface
- [ ] Build import interface with file upload
- [ ] Build export interface with options
- [ ] Create reports page
- [ ] Build user profile page
- [ ] Implement mobile-friendly QR scanner
- [ ] Create public device page (QR view)

## Phase 11: Testing & Quality Assurance
- [ ] Write unit tests for device procedures
- [ ] Write unit tests for transfer procedures
- [ ] Write unit tests for maintenance procedures
- [ ] Write unit tests for import/export procedures
- [ ] Write unit tests for depreciation calculations
- [ ] Write integration tests for workflows
- [ ] Test role-based access control
- [ ] Test Excel import validation
- [ ] Test email notifications
- [ ] Test QR code generation and public page
- [ ] Performance testing for large datasets
- [ ] Security testing (SQL injection, XSS, CSRF)

## Phase 12: Documentation & Deployment
- [x] Write API documentation
- [x] Create user manual for each role
- [ ] Create admin setup guide
- [x] Document database schema
- [x] Create sample Excel templates
- [ ] Write deployment guide
- [ ] Create troubleshooting guide
- [ ] Set up monitoring and logging
- [ ] Prepare for production deployment

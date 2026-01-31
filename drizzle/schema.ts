import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  date,
  json,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow with role-based access control.
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin", "unit_manager", "technician"]).default("user").notNull(),
    facultyId: int("facultyId"), // For unit managers and technicians
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    openIdIdx: uniqueIndex("openId_idx").on(table.openId),
    roleIdx: index("role_idx").on(table.role),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Faculties within the university.
 */
export const faculties = mysqlTable(
  "faculties",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    codeIdx: uniqueIndex("faculty_code_idx").on(table.code),
  })
);

export type Faculty = typeof faculties.$inferSelect;
export type InsertFaculty = typeof faculties.$inferInsert;

/**
 * Departments within faculties.
 */
export const departments = mysqlTable(
  "departments",
  {
    id: int("id").autoincrement().primaryKey(),
    facultyId: int("facultyId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    facultyIdIdx: index("department_facultyId_idx").on(table.facultyId),
    codeIdx: uniqueIndex("department_code_idx").on(table.code),
  })
);

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

/**
 * Laboratories within departments.
 */
export const laboratories = mysqlTable(
  "laboratories",
  {
    id: int("id").autoincrement().primaryKey(),
    departmentId: int("departmentId").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    location: text("location"), // Building and room number
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    departmentIdIdx: index("laboratory_departmentId_idx").on(table.departmentId),
    codeIdx: uniqueIndex("laboratory_code_idx").on(table.code),
  })
);

export type Laboratory = typeof laboratories.$inferSelect;
export type InsertLaboratory = typeof laboratories.$inferInsert;

/**
 * Devices (equipment) - Core asset table.
 * Device ID is immutable once created.
 */
export const devices = mysqlTable(
  "devices",
  {
    id: int("id").autoincrement().primaryKey(),
    deviceId: varchar("deviceId", { length: 100 }).notNull().unique(), // Immutable: DEV-FACULTY-YEAR-NUMBER
    name: varchar("name", { length: 255 }).notNull(),
    brand: varchar("brand", { length: 255 }), // Device manufacturer/brand
    category: varchar("category", { length: 100 }).notNull(),
    currentLaboratoryId: int("currentLaboratoryId").notNull(),
    currentDepartmentId: int("currentDepartmentId").notNull(), // Denormalized for quick access
    currentFacultyId: int("currentFacultyId").notNull(), // Denormalized for quick access
    purchaseDate: date("purchaseDate").notNull(),
    purchasePrice: decimal("purchasePrice", { precision: 12, scale: 2 }).notNull(),
    expectedLifetimeYears: int("expectedLifetimeYears").notNull(),
    currentStatus: mysqlEnum("currentStatus", ["working", "under_maintenance", "out_of_service"]).default("working").notNull(),
    currentIssue: text("currentIssue"), // Current maintenance issue/problem description
    notes: text("notes"),
    qrCodeToken: varchar("qrCodeToken", { length: 100 }).notNull().unique(), // Immutable token for QR URL
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    deviceIdIdx: uniqueIndex("device_deviceId_idx").on(table.deviceId),
    qrCodeTokenIdx: uniqueIndex("device_qrCodeToken_idx").on(table.qrCodeToken),
    currentLaboratoryIdIdx: index("device_currentLaboratoryId_idx").on(table.currentLaboratoryId),
    currentStatusIdx: index("device_currentStatus_idx").on(table.currentStatus),
    currentFacultyIdIdx: index("device_currentFacultyId_idx").on(table.currentFacultyId),
  })
);

export type Device = typeof devices.$inferSelect;
export type InsertDevice = typeof devices.$inferInsert;

/**
 * Transfers - Immutable audit trail of device movements.
 */
export const transfers = mysqlTable(
  "transfers",
  {
    id: int("id").autoincrement().primaryKey(),
    deviceId: int("deviceId").notNull(),
    fromLaboratoryId: int("fromLaboratoryId").notNull(),
    toLaboratoryId: int("toLaboratoryId").notNull(),
    fromFacultyId: int("fromFacultyId").notNull(),
    toFacultyId: int("toFacultyId").notNull(),
    transferDate: timestamp("transferDate").notNull(),
    reason: text("reason"),
    approvedBy: int("approvedBy"),
    approvalDate: timestamp("approvalDate"),
    notes: text("notes"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    deviceIdIdx: index("transfer_deviceId_idx").on(table.deviceId),
    transferDateIdx: index("transfer_transferDate_idx").on(table.transferDate),
  })
);

export type Transfer = typeof transfers.$inferSelect;
export type InsertTransfer = typeof transfers.$inferInsert;

/**
 * Maintenance Requests - Workflow for maintenance activities.
 */
export const maintenanceRequests = mysqlTable(
  "maintenance_requests",
  {
    id: int("id").autoincrement().primaryKey(),
    deviceId: int("deviceId").notNull(),
    maintenanceType: mysqlEnum("maintenanceType", ["periodic", "emergency"]).notNull(),
    status: mysqlEnum("status", ["requested", "approved", "in_progress", "completed", "cancelled"]).default("requested").notNull(),
    requestedBy: int("requestedBy").notNull(),
    assignedTo: int("assignedTo"), // Technician
    scheduledDate: timestamp("scheduledDate"),
    completedDate: timestamp("completedDate"),
    cost: decimal("cost", { precision: 12, scale: 2 }),
    notes: text("notes"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    deviceIdIdx: index("maintenance_request_deviceId_idx").on(table.deviceId),
    statusIdx: index("maintenance_request_status_idx").on(table.status),
    assignedToIdx: index("maintenance_request_assignedTo_idx").on(table.assignedTo),
  })
);

export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type InsertMaintenanceRequest = typeof maintenanceRequests.$inferInsert;

/**
 * Maintenance History - Immutable record of completed maintenance.
 */
export const maintenanceHistory = mysqlTable(
  "maintenance_history",
  {
    id: int("id").autoincrement().primaryKey(),
    deviceId: int("deviceId").notNull(),
    maintenanceRequestId: int("maintenanceRequestId"),
    maintenanceType: mysqlEnum("maintenanceType", ["periodic", "emergency"]).notNull(),
    technicianName: varchar("technicianName", { length: 255 }).notNull(),
    technicianId: int("technicianId"),
    maintenanceDate: date("maintenanceDate").notNull(),
    cost: decimal("cost", { precision: 12, scale: 2 }),
    notes: text("notes"),
    createdBy: int("createdBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    deviceIdIdx: index("maintenance_history_deviceId_idx").on(table.deviceId),
    maintenanceDateIdx: index("maintenance_history_maintenanceDate_idx").on(table.maintenanceDate),
  })
);

export type MaintenanceHistory = typeof maintenanceHistory.$inferSelect;
export type InsertMaintenanceHistory = typeof maintenanceHistory.$inferInsert;

/**
 * Depreciation Records - Historical snapshots of device depreciation.
 */
export const depreciationRecords = mysqlTable(
  "depreciation_records",
  {
    id: int("id").autoincrement().primaryKey(),
    deviceId: int("deviceId").notNull(),
    originalPrice: decimal("originalPrice", { precision: 12, scale: 2 }).notNull(),
    expectedLifetimeYears: int("expectedLifetimeYears").notNull(),
    annualDepreciation: decimal("annualDepreciation", { precision: 12, scale: 2 }).notNull(),
    calculationDate: date("calculationDate").notNull(),
    currentBookValue: decimal("currentBookValue", { precision: 12, scale: 2 }).notNull(),
    depreciationPercentage: decimal("depreciationPercentage", { precision: 5, scale: 2 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    deviceIdIdx: index("depreciation_records_deviceId_idx").on(table.deviceId),
    calculationDateIdx: index("depreciation_records_calculationDate_idx").on(table.calculationDate),
  })
);

export type DepreciationRecord = typeof depreciationRecords.$inferSelect;
export type InsertDepreciationRecord = typeof depreciationRecords.$inferInsert;

/**
 * Audit Logs - Complete audit trail for all changes.
 */
export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    entityType: varchar("entityType", { length: 50 }).notNull(), // device, transfer, maintenance
    entityId: int("entityId").notNull(),
    action: varchar("action", { length: 50 }).notNull(), // create, update, delete, approve
    userId: int("userId").notNull(),
    oldValues: json("oldValues"), // JSON object of previous values
    newValues: json("newValues"), // JSON object of new values
    ipAddress: varchar("ipAddress", { length: 45 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    entityTypeIdx: index("audit_logs_entityType_idx").on(table.entityType),
    entityIdIdx: index("audit_logs_entityId_idx").on(table.entityId),
    userIdIdx: index("audit_logs_userId_idx").on(table.userId),
    createdAtIdx: index("audit_logs_createdAt_idx").on(table.createdAt),
  })
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Import Logs - Track Excel imports and their results.
 */
export const importLogs = mysqlTable(
  "import_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    importType: mysqlEnum("importType", ["devices", "transfers", "maintenance"]).notNull(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    totalRecords: int("totalRecords").notNull(),
    successfulRecords: int("successfulRecords").notNull(),
    failedRecords: int("failedRecords").notNull(),
    errors: json("errors"), // Array of error objects
    importedBy: int("importedBy").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    importTypeIdx: index("import_logs_importType_idx").on(table.importType),
    createdAtIdx: index("import_logs_createdAt_idx").on(table.createdAt),
  })
);

export type ImportLog = typeof importLogs.$inferSelect;
export type InsertImportLog = typeof importLogs.$inferInsert;

/**
 * Notification Preferences - User preferences for email notifications.
 */
export const notificationPreferences = mysqlTable(
  "notification_preferences",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique(),
    maintenanceDueNotifications: boolean("maintenanceDueNotifications").default(true).notNull(),
    maintenanceRequestNotifications: boolean("maintenanceRequestNotifications").default(true).notNull(),
    transferApprovedNotifications: boolean("transferApprovedNotifications").default(true).notNull(),
    endOfLifeAlerts: boolean("endOfLifeAlerts").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: uniqueIndex("notification_preferences_userId_idx").on(table.userId),
  })
);

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

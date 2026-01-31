import dotenv from "dotenv";
import path from "path";
import { eq, desc, and, or, gte, lte, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  faculties,
  departments,
  laboratories,
  devices,
  transfers,
  maintenanceRequests,
  maintenanceHistory,
  depreciationRecords,
  auditLogs,
  importLogs,
  notificationPreferences,
  Faculty,
  Department,
  Laboratory,
  Device,
  Transfer,
  MaintenanceRequest,
  MaintenanceHistory,
  DepreciationRecord,
  InsertDepreciationRecord,
  AuditLog,
  ImportLog,
  User,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

/**
 * Get or initialize database connection
 */
export async function getDb() {
  // Ensure environment variables are loaded (for scripts run directly)
  if (!process.env.DATABASE_URL) {
    try {
      const envPath = path.resolve(process.cwd(), ".env");
      dotenv.config({ path: envPath });
    } catch (err) {
      // ignore
    }
  }

  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
      console.log("✅ Connected to database");
    } catch (error) {
      console.error("Failed to initialize database connection:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER FUNCTIONS
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("Database connection not available");
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection not available");
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listUsers(): Promise<User[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUser(
  id: number,
  data: {
    name?: string;
    email?: string;
    role?: "admin" | "unit_manager" | "technician" | "user";
  }
): Promise<User | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database connection not available");

  const existing = await getUserById(id);
  if (!existing) throw new Error("User not found");

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.role !== undefined) updateData.role = data.role;

  if (Object.keys(updateData).length === 0) {
    return existing;
  }

  updateData.updatedAt = new Date();

  await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id));

  return await getUserById(id);
}

// ============================================================================
// FACULTY, DEPARTMENT, LABORATORY FUNCTIONS
// ============================================================================

export async function getFaculties() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(faculties).orderBy(faculties.name);
}

export async function getFacultyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(faculties).where(eq(faculties.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getDepartmentsByFaculty(facultyId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(departments)
    .where(eq(departments.facultyId, facultyId))
    .orderBy(departments.name);
}

export async function getAllDepartments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(departments).orderBy(departments.name);
}

export async function getDepartmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(departments).where(eq(departments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLaboratoriesByDepartment(departmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(laboratories)
    .where(eq(laboratories.departmentId, departmentId))
    .orderBy(laboratories.name);
}

export async function getAllLaboratories() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(laboratories)
    .orderBy(laboratories.name);
}

export async function getLaboratoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(laboratories).where(eq(laboratories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// DEVICE FUNCTIONS
// ============================================================================

export async function createDevice(data: {
  deviceId: string;
  name: string;
  brand?: string;
  category: string;
  currentLaboratoryId: number;
  currentDepartmentId: number;
  currentFacultyId: number;
  purchaseDate: Date;
  purchasePrice: string;
  expectedLifetimeYears: number;
  currentStatus: "working" | "under_maintenance" | "out_of_service";
  currentIssue?: string | null;
  notes?: string;
  qrCodeToken: string;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(devices).values(data as any);
  const deviceId = (result as any).insertId || 1;

  // Create initial depreciation record
  const annualDepreciation = parseFloat(data.purchasePrice) / data.expectedLifetimeYears;
  const depRecord: InsertDepreciationRecord = {
    deviceId: deviceId,
    originalPrice: data.purchasePrice,
    expectedLifetimeYears: data.expectedLifetimeYears,
    annualDepreciation: annualDepreciation.toString(),
    calculationDate: new Date(),
    currentBookValue: data.purchasePrice,
    depreciationPercentage: "0",
  };
  await db.insert(depreciationRecords).values(depRecord);

  return deviceId;
}

export async function getDeviceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(devices).where(eq(devices.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getDeviceByDeviceId(deviceId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(devices).where(eq(devices.deviceId, deviceId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getDeviceByQRToken(qrCodeToken: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(devices).where(eq(devices.qrCodeToken, qrCodeToken)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getDeviceWithHierarchyByQRToken(qrCodeToken: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const device = await db.select().from(devices).where(eq(devices.qrCodeToken, qrCodeToken)).limit(1);
  if (device.length === 0) return undefined;
  
  const dev = device[0];
  
  // Get faculty, department, and laboratory info
  const faculty = dev.currentFacultyId ? await getFacultyById(dev.currentFacultyId) : null;
  const department = dev.currentDepartmentId ? await getDepartmentById(dev.currentDepartmentId) : null;
  const laboratory = dev.currentLaboratoryId ? await getLaboratoryById(dev.currentLaboratoryId) : null;
  
  return {
    ...dev,
    facultyName: faculty?.name || "Unknown",
    departmentName: department?.name || "Unknown",
    laboratoryName: laboratory?.name || "Unknown",
    laboratoryCode: laboratory?.code || "---",
  };
}

export async function listDevices(filters?: {
  facultyId?: number;
  departmentId?: number;
  laboratoryId?: number;
  status?: "working" | "under_maintenance" | "out_of_service";
  category?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.facultyId) conditions.push(eq(devices.currentFacultyId, filters.facultyId));
  if (filters?.departmentId) conditions.push(eq(devices.currentDepartmentId, filters.departmentId));
  if (filters?.laboratoryId) conditions.push(eq(devices.currentLaboratoryId, filters.laboratoryId));
  if (filters?.status) conditions.push(eq(devices.currentStatus, filters.status));
  if (filters?.category) conditions.push(like(devices.category, `%${filters.category}%`));

  let query: any = db.select().from(devices);
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  query = query.orderBy(desc(devices.createdAt));

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  return await query;
}

export async function updateDevice(
  id: number,
  data: Partial<{
    name: string;
    category: string;
    currentStatus: "working" | "under_maintenance" | "out_of_service";
    notes: string;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(devices).set(data).where(eq(devices.id, id));
}

// ============================================================================
// TRANSFER FUNCTIONS
// ============================================================================

export async function createTransfer(data: {
  deviceId: number;
  fromLaboratoryId: number;
  fromDepartmentId: number;
  toLaboratoryId: number;
  toDepartmentId: number;
  fromFacultyId: number;
  toFacultyId: number;
  transferDate: Date;
  reason?: string;
  approvedBy?: number;
  approvalDate?: Date;
  notes?: string;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Record transfer
  const result = await db.insert(transfers).values(data);

  // Update device current location
  await db
    .update(devices)
    .set({
      currentLaboratoryId: data.toLaboratoryId,
      currentDepartmentId: data.toDepartmentId,
      currentFacultyId: data.toFacultyId,
    })
    .where(eq(devices.id, data.deviceId));

  return result[0];
}

export async function getTransfersByDevice(deviceId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(transfers)
    .where(eq(transfers.deviceId, deviceId))
    .orderBy(desc(transfers.transferDate));
}

export async function listTransfers(filters?: {
  deviceId?: number;
  facultyId?: number;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.deviceId) conditions.push(eq(transfers.deviceId, filters.deviceId));
  if (filters?.facultyId) conditions.push(eq(transfers.toFacultyId, filters.facultyId));

  let query: any = db.select().from(transfers);
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  query = query.orderBy(desc(transfers.transferDate));

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  return await query;
}

export async function getTransferById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(transfers).where(eq(transfers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTransfer(id: number, data: Partial<{
  approvedBy: number;
  approvalDate: Date;
  status: string;
}>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(transfers).set(data).where(eq(transfers.id, id));
}

// ============================================================================
// MAINTENANCE FUNCTIONS
// ============================================================================

export async function createMaintenanceRequest(data: {
  deviceId: number;
  maintenanceType: "periodic" | "emergency";
  requestedBy: number;
  scheduledDate?: Date;
  notes?: string;
  createdBy: number;
  currentIssue?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(maintenanceRequests).values({
    ...data,
    status: "requested",
  });

  // Update device status to under_maintenance and set current issue
  await db
    .update(devices)
    .set({
      currentStatus: "under_maintenance",
      currentIssue: data.currentIssue || data.notes || null,
    })
    .where(eq(devices.id, data.deviceId));

  return result[0];
}

export async function approveMaintenanceRequest(
  id: number,
  assignedTo: number,
  scheduledDate?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(maintenanceRequests)
    .set({
      status: "approved",
      assignedTo,
      scheduledDate,
    })
    .where(eq(maintenanceRequests.id, id));
}

export async function completeMaintenanceRequest(
  id: number,
  cost?: string,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const request = await db
    .select()
    .from(maintenanceRequests)
    .where(eq(maintenanceRequests.id, id))
    .limit(1);

  if (!request.length) throw new Error("Maintenance request not found");

  const req = request[0];

  // Update request status
  // Convert empty strings to null for optional fields
  const costValue = cost && cost.trim() ? parseFloat(cost) : null;
  const notesValue = notes && notes.trim() ? notes : null;

  const updateData: any = {
    status: "completed" as const,
    completedDate: new Date(),
  };

  if (costValue !== null) {
    updateData.cost = costValue;
  }
  if (notesValue !== null) {
    updateData.notes = notesValue;
  }

  await db
    .update(maintenanceRequests)
    .set(updateData)
    .where(eq(maintenanceRequests.id, id));

  // Update device status back to working and clear issue
  await db
    .update(devices)
    .set({
      currentStatus: "working",
      currentIssue: null,
    })
    .where(eq(devices.id, req.deviceId));

  // Create maintenance history record
  const device = await getDeviceById(req.deviceId);
  if (device) {
    const technicianName = req.assignedTo
      ? (await getUserById(req.assignedTo))?.name || "Unknown"
      : "Unknown";

    // Convert date properly (maintenanceHistory uses date type, not timestamp)
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const historyData: any = {
      deviceId: req.deviceId,
      maintenanceRequestId: id,
      maintenanceType: req.maintenanceType,
      technicianName,
      technicianId: req.assignedTo || null,
      maintenanceDate: dateStr,
      createdBy: req.createdBy,
    };

    // Add cost if provided
    const costValue = cost && cost.trim() ? parseFloat(cost) : null;
    if (costValue !== null) {
      historyData.cost = costValue;
    }

    // Add notes if provided
    const notesValue = notes && notes.trim() ? notes : null;
    if (notesValue !== null) {
      historyData.notes = notesValue;
    }

    await db.insert(maintenanceHistory).values(historyData);
  }
}

export async function getMaintenanceRequestsByDevice(deviceId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(maintenanceRequests)
    .where(eq(maintenanceRequests.deviceId, deviceId))
    .orderBy(desc(maintenanceRequests.createdAt));
}

export async function getMaintenanceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select({
      id: maintenanceRequests.id,
      deviceId: maintenanceRequests.deviceId,
      maintenanceType: maintenanceRequests.maintenanceType,
      status: maintenanceRequests.status,
      notes: maintenanceRequests.notes,
      createdAt: maintenanceRequests.createdAt,
      completedDate: maintenanceRequests.completedDate,
      cost: maintenanceRequests.cost,
      assignedTo: maintenanceRequests.assignedTo,
      scheduledDate: maintenanceRequests.scheduledDate,
      requestedBy: maintenanceRequests.requestedBy,
      createdBy: maintenanceRequests.createdBy,
      // Device info
      deviceName: devices.name,
      deviceBrand: devices.brand,
      deviceCategory: devices.category,
      deviceCurrentStatus: devices.currentStatus,
      currentIssue: devices.currentIssue,
      purchasePrice: devices.purchasePrice,
      expectedLifetimeYears: devices.expectedLifetimeYears,
      purchaseDate: devices.purchaseDate,
      // Faculty info
      facultyName: faculties.name,
      // Department info
      departmentName: departments.name,
      // Laboratory info
      laboratoryName: laboratories.name,
    })
    .from(maintenanceRequests)
    .leftJoin(devices, eq(maintenanceRequests.deviceId, devices.id))
    .leftJoin(faculties, eq(devices.currentFacultyId, faculties.id))
    .leftJoin(departments, eq(devices.currentDepartmentId, departments.id))
    .leftJoin(laboratories, eq(devices.currentLaboratoryId, laboratories.id))
    .where(eq(maintenanceRequests.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getMaintenanceHistoryByDevice(deviceId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(maintenanceHistory)
    .where(eq(maintenanceHistory.deviceId, deviceId))
    .orderBy(desc(maintenanceHistory.maintenanceDate));
}

export async function listMaintenanceRequests(filters?: {
  status?: string;
  assignedTo?: number;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.status) conditions.push(eq(maintenanceRequests.status, filters.status as any));
  if (filters?.assignedTo) conditions.push(eq(maintenanceRequests.assignedTo, filters.assignedTo));

  let query: any = db
    .select({
      id: maintenanceRequests.id,
      deviceId: maintenanceRequests.deviceId,
      maintenanceType: maintenanceRequests.maintenanceType,
      status: maintenanceRequests.status,
      notes: maintenanceRequests.notes,
      createdAt: maintenanceRequests.createdAt,
      completedDate: maintenanceRequests.completedDate,
      cost: maintenanceRequests.cost,
      assignedTo: maintenanceRequests.assignedTo,
      scheduledDate: maintenanceRequests.scheduledDate,
      deviceName: devices.name,
      deviceBrand: devices.brand,
    })
    .from(maintenanceRequests)
    .leftJoin(devices, eq(maintenanceRequests.deviceId, devices.id));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  query = query.orderBy(desc(maintenanceRequests.createdAt));

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  return await query;
}

// ============================================================================
// DEPRECIATION FUNCTIONS
// ============================================================================

export async function getDepreciationByDevice(deviceId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(depreciationRecords)
    .where(eq(depreciationRecords.deviceId, deviceId))
    .orderBy(desc(depreciationRecords.calculationDate))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function calculateDepreciation(device: Device): Promise<DepreciationRecord | null> {
  const db = await getDb();
  if (!db) return null;

  const purchasePrice = parseFloat(device.purchasePrice.toString());
  const expectedLifetime = device.expectedLifetimeYears;
  const annualDepreciation = purchasePrice / expectedLifetime;

  const purchaseDate = new Date(device.purchaseDate);
  const today = new Date();
  const yearsElapsed =
    (today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

  const currentBookValue = Math.max(0, purchasePrice - annualDepreciation * yearsElapsed);
  const depreciationPercentage = (annualDepreciation / purchasePrice) * 100;

  const record: InsertDepreciationRecord = {
    deviceId: device.id,
    originalPrice: purchasePrice.toString(),
    expectedLifetimeYears: expectedLifetime,
    annualDepreciation: annualDepreciation.toString(),
    calculationDate: today,
    currentBookValue: currentBookValue.toString(),
    depreciationPercentage: depreciationPercentage.toString(),
  };

  await db.insert(depreciationRecords).values(record);

  return record as any;
}

// ============================================================================
// AUDIT LOG FUNCTIONS
// ============================================================================

export async function createAuditLog(data: {
  entityType: string;
  entityId: number;
  action: string;
  userId: number;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
}) {
  const db = await getDb();
  if (!db) return;

  await db.insert(auditLogs).values(data);
}

export async function getAuditLogs(filters?: {
  entityType?: string;
  entityId?: number;
  userId?: number;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.entityType) conditions.push(eq(auditLogs.entityType, filters.entityType));
  if (filters?.entityId) conditions.push(eq(auditLogs.entityId, filters.entityId));
  if (filters?.userId) conditions.push(eq(auditLogs.userId, filters.userId));

  let query: any = db.select().from(auditLogs);
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  query = query.orderBy(desc(auditLogs.createdAt));

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  return await query;
}

// ============================================================================
// IMPORT LOG FUNCTIONS
// ============================================================================

export async function createImportLog(data: {
  importType: "devices" | "transfers" | "maintenance";
  fileName: string;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors?: any;
  importedBy: number;
}) {
  const db = await getDb();
  if (!db) return;

  await db.insert(importLogs).values(data);
}

export async function getImportLogs(filters?: {
  importType?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.importType) conditions.push(eq(importLogs.importType, filters.importType as any));

  let query: any = db.select().from(importLogs);
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  query = query.orderBy(desc(importLogs.createdAt));

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  return await query;
}

// ============================================================================
// NOTIFICATION PREFERENCE FUNCTIONS
// ============================================================================

export async function getNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateNotificationPreferences(
  userId: number,
  data: Partial<{
    maintenanceDueNotifications: boolean;
    maintenanceRequestNotifications: boolean;
    transferApprovedNotifications: boolean;
    endOfLifeAlerts: boolean;
  }>
) {
  const db = await getDb();
  if (!db) return;

  const existing = await getNotificationPreferences(userId);
  if (existing) {
    await db
      .update(notificationPreferences)
      .set(data)
      .where(eq(notificationPreferences.userId, userId));
  } else {
    await db.insert(notificationPreferences).values({
      userId,
      ...data,
    });
  }
}

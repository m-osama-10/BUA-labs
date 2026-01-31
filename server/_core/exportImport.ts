import * as db from "../db";
import { nanoid } from "nanoid";

/**
 * Simple CSV stringify function
 */
function stringifyCSV(records: any[], columns: string[]): string {
  const headers = columns.join(",");
  const rows = records.map((record) =>
    columns.map((col) => {
      const value = record[col];
      if (value === null || value === undefined) return "";
      const stringValue = String(value);
      // Escape quotes and wrap in quotes if contains comma or quotes
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(",")
  );
  return [headers, ...rows].join("\n");
}

/**
 * Simple CSV parse function
 */
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || "";
    });
    records.push(record);
  }

  return records;
}

/**
 * Export all devices to CSV format
 */
export async function exportDevicesToCSV(): Promise<string> {
  const devices = await db.listDevices({});

  const devicesWithDetails = devices.map((device: any) => ({
    deviceId: device.deviceId,
    name: device.name,
    brand: device.brand || "",
    category: device.category,
    laboratoryId: device.currentLaboratoryId,
    departmentId: device.currentDepartmentId,
    facultyId: device.currentFacultyId,
    purchaseDate: device.purchaseDate instanceof Date 
      ? device.purchaseDate.toISOString().split("T")[0]
      : device.purchaseDate,
    purchasePrice: device.purchasePrice,
    expectedLifetimeYears: device.expectedLifetimeYears,
    currentStatus: device.currentStatus,
    currentIssue: device.currentIssue || "",
    notes: device.notes || "",
    createdAt: device.createdAt instanceof Date
      ? device.createdAt.toISOString()
      : device.createdAt,
  }));

  return stringifyCSV(devicesWithDetails, [
    "deviceId",
    "name",
    "brand",
    "category",
    "laboratoryId",
    "departmentId",
    "facultyId",
    "purchaseDate",
    "purchasePrice",
    "expectedLifetimeYears",
    "currentStatus",
    "currentIssue",
    "notes",
    "createdAt",
  ]);
}

/**
 * Export all faculties to CSV format
 */
export async function exportFacultiesToCSV(): Promise<string> {
  const faculties = await db.getFaculties();

  const facultiesData = faculties.map((f: any) => ({
    id: f.id,
    name: f.name,
    code: f.code,
    createdAt: f.createdAt instanceof Date ? f.createdAt.toISOString() : f.createdAt,
  }));

  return stringifyCSV(facultiesData, ["id", "name", "code", "createdAt"]);
}

/**
 * Export all departments to CSV format
 */
export async function exportDepartmentsToCSV(): Promise<string> {
  const departments = await db.getAllDepartments();

  const deptData = departments.map((d: any) => ({
    id: d.id,
    facultyId: d.facultyId,
    name: d.name,
    code: d.code,
    createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt,
  }));

  return stringifyCSV(deptData, ["id", "facultyId", "name", "code", "createdAt"]);
}

/**
 * Export all laboratories to CSV format
 */
export async function exportLaboratoriesToCSV(): Promise<string> {
  const labs = await db.getAllLaboratories();

  const labsData = labs.map((l: any) => ({
    id: l.id,
    departmentId: l.departmentId,
    name: l.name,
    code: l.code,
    location: l.location || "",
    createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
  }));

  return stringifyCSV(labsData, [
    "id",
    "departmentId",
    "name",
    "code",
    "location",
    "createdAt",
  ]);
}

/**
 * Export all transfers to CSV format
 */
export async function exportTransfersToCSV(): Promise<string> {
  const transfers = await db.listTransfers({});

  const transfersData = transfers.map((t: any) => ({
    id: t.id,
    deviceId: t.deviceId,
    fromLaboratoryId: t.fromLaboratoryId,
    toLaboratoryId: t.toLaboratoryId,
    transferDate: t.transferDate instanceof Date 
      ? t.transferDate.toISOString()
      : t.transferDate,
    reason: t.reason || "",
    approvedBy: t.approvedBy || "",
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : t.createdAt,
  }));

  return stringifyCSV(transfersData, [
    "id",
    "deviceId",
    "fromLaboratoryId",
    "toLaboratoryId",
    "transferDate",
    "reason",
    "approvedBy",
    "createdAt",
  ]);
}

/**
 * Export all maintenance requests to CSV format
 */
export async function exportMaintenanceToCSV(): Promise<string> {
  const maintenance = await db.listMaintenanceRequests({});

  const mainData = maintenance.map((m: any) => ({
    id: m.id,
    deviceId: m.deviceId,
    requestedBy: m.requestedBy,
    status: m.status,
    description: m.description || "",
    priority: m.priority || "",
    requestDate: m.requestDate instanceof Date
      ? m.requestDate.toISOString()
      : m.requestDate,
    completedDate: m.completedDate
      ? m.completedDate instanceof Date
        ? m.completedDate.toISOString()
        : m.completedDate
      : "",
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
  }));

  return stringifyCSV(mainData, [
    "id",
    "deviceId",
    "requestedBy",
    "status",
    "description",
    "priority",
    "requestDate",
    "completedDate",
    "createdAt",
  ]);
}

/**
 * Export all audit logs to CSV format
 */
export async function exportAuditLogsToCSV(): Promise<string> {
  try {
    const logs = await db.getAuditLogs({ limit: 10000 });
    
    if (!logs || logs.length === 0) {
      // Return empty CSV with headers
      return stringifyCSV([], [
        "id",
        "entityType",
        "entityId",
        "action",
        "userId",
        "oldValues",
        "newValues",
        "ipAddress",
        "createdAt",
      ]);
    }

    const logsData = logs.map((l: any) => ({
      id: l.id,
      entityType: l.entityType || "",
      entityId: l.entityId || "",
      action: l.action,
      userId: l.userId,
      oldValues: typeof l.oldValues === "string" ? l.oldValues : JSON.stringify(l.oldValues || {}),
      newValues: typeof l.newValues === "string" ? l.newValues : JSON.stringify(l.newValues || {}),
      ipAddress: l.ipAddress || "",
      createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt,
    }));

    return stringifyCSV(logsData, [
      "id",
      "entityType",
      "entityId",
      "action",
      "userId",
      "oldValues",
      "newValues",
      "ipAddress",
      "createdAt",
    ]);
  } catch (error) {
    console.error("Error exporting audit logs:", error);
    // Return empty CSV with headers if there's an error
    return stringifyCSV([], [
      "id",
      "entityType",
      "entityId",
      "action",
      "userId",
      "oldValues",
      "newValues",
      "ipAddress",
      "createdAt",
    ]);
  }
}

/**
 * Generate a complete export with all data
 */
export async function generateCompleteExport(): Promise<{
  [key: string]: string;
}> {
  const exports = {
    devices: await exportDevicesToCSV(),
    faculties: await exportFacultiesToCSV(),
    departments: await exportDepartmentsToCSV(),
    laboratories: await exportLaboratoriesToCSV(),
    transfers: await exportTransfersToCSV(),
    maintenance: await exportMaintenanceToCSV(),
    auditLogs: await exportAuditLogsToCSV(),
  };

  return exports;
}

/**
 * Parse and import devices from CSV
 */
export async function importDevicesFromCSV(csvContent: string, userId: number) {
  const records = parseCSV(csvContent);

  const results = {
    imported: 0,
    skipped: 0,
    errors: [] as string[],
  };

  for (const record of records) {
    try {
      // Validate required fields
      if (!record.deviceId || !record.name || !record.category) {
        results.skipped++;
        results.errors.push(
          `Row skipped: Missing required fields (deviceId, name, category)`
        );
        continue;
      }

      // Check if device already exists
      const existing = await db.getDeviceByDeviceId(record.deviceId);
      if (existing) {
        results.skipped++;
        continue;
      }

      // Create device with required qrCodeToken
      await db.createDevice({
        deviceId: record.deviceId,
        name: record.name,
        brand: record.brand || undefined,
        category: record.category,
        currentLaboratoryId: parseInt(record.laboratoryId) || 1,
        currentDepartmentId: parseInt(record.departmentId) || 1,
        currentFacultyId: parseInt(record.facultyId) || 1,
        purchaseDate: new Date(record.purchaseDate),
        purchasePrice: record.purchasePrice,
        expectedLifetimeYears: parseInt(record.expectedLifetimeYears) || 5,
        currentStatus: "working",
        currentIssue: undefined,
        notes: record.notes || undefined,
        qrCodeToken: nanoid(20),
        createdBy: userId,
      });

      results.imported++;
    } catch (error) {
      results.errors.push(
        `Error importing device ${record.deviceId}: ${String(error)}`
      );
    }
  }

  return results;
}

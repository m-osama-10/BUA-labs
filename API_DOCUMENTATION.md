# BUA Asset Management System - API Documentation

## Overview

The BUA Asset Management System uses **tRPC** for all backend communication. tRPC provides end-to-end type safety and automatic type inference between frontend and backend. All procedures are organized into logical routers.

## Authentication

All procedures except those explicitly marked as `public` require authentication via Manus OAuth. The authenticated user is available in the procedure context as `ctx.user`.

### User Object

```typescript
{
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  role: "user" | "admin" | "unit_manager" | "technician";
  facultyId: number | null;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}
```

---

## Device Router

### `devices.list`

**Type:** Protected Query  
**Access:** All authenticated users

Retrieve a list of devices with optional filtering.

**Input:**
```typescript
{
  facultyId?: number;
  departmentId?: number;
  laboratoryId?: number;
  status?: "working" | "under_maintenance" | "out_of_service";
  category?: string;
  limit?: number; // default: 50
  offset?: number; // default: 0
}
```

**Output:**
```typescript
Device[]
```

**Example:**
```typescript
const { data: devices } = trpc.devices.list.useQuery({
  facultyId: 1,
  status: "working",
  limit: 20,
});
```

---

### `devices.getById`

**Type:** Protected Query  
**Access:** All authenticated users

Get a specific device by its database ID.

**Input:** `number` (device database ID)

**Output:**
```typescript
{
  id: number;
  deviceId: string; // Immutable: DEV-FACULTY-YEAR-NUMBER
  name: string;
  category: string;
  currentLaboratoryId: number;
  currentDepartmentId: number;
  currentFacultyId: number;
  purchaseDate: Date;
  purchasePrice: Decimal;
  expectedLifetimeYears: number;
  currentStatus: "working" | "under_maintenance" | "out_of_service";
  notes: string | null;
  qrCodeToken: string; // Immutable
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### `devices.getByDeviceId`

**Type:** Protected Query  
**Access:** All authenticated users

Get a device by its immutable Device ID.

**Input:** `string` (e.g., "DEV-ENG-2024-0001")

**Output:** Same as `getById`

---

### `devices.getPublic`

**Type:** Public Query  
**Access:** No authentication required

Get device information via QR code token. Used for public device pages.

**Input:** `string` (QR code token)

**Output:** Device object (same as `getById`)

---

### `devices.create`

**Type:** Admin Mutation  
**Access:** Admin only

Create a new device with auto-generated Device ID and QR code.

**Input:**
```typescript
{
  name: string;
  category: string;
  currentLaboratoryId: number;
  currentDepartmentId: number;
  currentFacultyId: number;
  purchaseDate: Date;
  purchasePrice: string; // Decimal as string
  expectedLifetimeYears: number;
  notes?: string;
}
```

**Output:**
```typescript
{
  id: number;
  deviceId: string; // Generated: DEV-FACULTY-YEAR-NUMBER
  qrCodeToken: string; // Generated UUID
}
```

**Example:**
```typescript
const { mutate: createDevice } = trpc.devices.create.useMutation({
  onSuccess: (data) => {
    console.log("Device created:", data.deviceId);
  },
});

createDevice({
  name: "Electron Microscope A",
  category: "Microscope",
  currentLaboratoryId: 5,
  currentDepartmentId: 2,
  currentFacultyId: 1,
  purchaseDate: new Date("2024-01-15"),
  purchasePrice: "50000.00",
  expectedLifetimeYears: 10,
  notes: "High-resolution imaging",
});
```

---

### `devices.update`

**Type:** Admin Mutation  
**Access:** Admin only

Update device information (non-immutable fields only).

**Input:**
```typescript
{
  id: number;
  name?: string;
  category?: string;
  currentStatus?: "working" | "under_maintenance" | "out_of_service";
  notes?: string;
}
```

**Output:**
```typescript
{ success: true }
```

---

## Transfer Router

### `transfers.list`

**Type:** Protected Query  
**Access:** All authenticated users

Retrieve transfer records with optional filtering.

**Input:**
```typescript
{
  deviceId?: number;
  facultyId?: number;
  limit?: number; // default: 50
  offset?: number; // default: 0
}
```

**Output:**
```typescript
Transfer[]
```

---

### `transfers.getHistory`

**Type:** Protected Query  
**Access:** All authenticated users

Get complete transfer history for a specific device.

**Input:** `number` (device ID)

**Output:**
```typescript
{
  id: number;
  deviceId: number;
  fromLaboratoryId: number;
  toLaboratoryId: number;
  fromFacultyId: number;
  toFacultyId: number;
  transferDate: Date;
  reason: string | null;
  approvedBy: number | null;
  approvalDate: Date | null;
  notes: string | null;
  createdBy: number;
  createdAt: Date;
}[]
```

---

### `transfers.create`

**Type:** Unit Manager Mutation  
**Access:** Admin, Unit Manager

Create a new transfer request.

**Input:**
```typescript
{
  deviceId: number;
  fromLaboratoryId: number;
  toLaboratoryId: number;
  fromFacultyId: number;
  toFacultyId: number;
  transferDate: Date;
  reason?: string;
  notes?: string;
}
```

**Output:**
```typescript
{
  id: number;
  success: true;
}
```

---

### `transfers.approve`

**Type:** Unit Manager Mutation  
**Access:** Admin, Unit Manager

Approve a transfer request.

**Input:**
```typescript
{
  transferId: number;
}
```

**Output:**
```typescript
{ success: true }
```

---

## Maintenance Router

### `maintenance.list`

**Type:** Protected Query  
**Access:** All authenticated users

Retrieve maintenance requests with optional filtering.

**Input:**
```typescript
{
  status?: string; // "requested", "approved", "in_progress", "completed"
  assignedTo?: number; // User ID
  limit?: number; // default: 50
  offset?: number; // default: 0
}
```

**Output:**
```typescript
MaintenanceRequest[]
```

---

### `maintenance.getHistory`

**Type:** Protected Query  
**Access:** All authenticated users

Get maintenance history for a specific device.

**Input:** `number` (device ID)

**Output:**
```typescript
{
  id: number;
  deviceId: number;
  maintenanceRequestId: number | null;
  maintenanceType: "periodic" | "emergency";
  technicianName: string;
  technicianId: number | null;
  maintenanceDate: Date;
  cost: Decimal | null;
  notes: string | null;
  createdBy: number;
  createdAt: Date;
}[]
```

---

### `maintenance.create`

**Type:** Protected Mutation  
**Access:** All authenticated users

Create a new maintenance request.

**Input:**
```typescript
{
  deviceId: number;
  maintenanceType: "periodic" | "emergency";
  scheduledDate?: Date;
  notes?: string;
}
```

**Output:**
```typescript
{
  id: number;
  success: true;
}
```

---

### `maintenance.approve`

**Type:** Unit Manager Mutation  
**Access:** Admin, Unit Manager

Approve and assign a maintenance request.

**Input:**
```typescript
{
  requestId: number;
  assignedTo: number; // Technician user ID
  scheduledDate?: Date;
}
```

**Output:**
```typescript
{ success: true }
```

---

### `maintenance.complete`

**Type:** Technician Mutation  
**Access:** Admin, Unit Manager, Technician

Mark a maintenance request as complete.

**Input:**
```typescript
{
  requestId: number;
  cost?: string; // Decimal as string
  notes?: string;
}
```

**Output:**
```typescript
{ success: true }
```

---

## Hierarchy Router

### `hierarchy.faculties`

**Type:** Public Query  
**Access:** No authentication required

Get all faculties.

**Input:** None

**Output:**
```typescript
{
  id: number;
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}[]
```

---

### `hierarchy.departments`

**Type:** Public Query  
**Access:** No authentication required

Get departments for a faculty.

**Input:** `number` (faculty ID)

**Output:**
```typescript
{
  id: number;
  facultyId: number;
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}[]
```

---

### `hierarchy.laboratories`

**Type:** Public Query  
**Access:** No authentication required

Get laboratories for a department.

**Input:** `number` (department ID)

**Output:**
```typescript
{
  id: number;
  departmentId: number;
  name: string;
  code: string;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
}[]
```

---

## Depreciation Router

### `depreciation.getByDevice`

**Type:** Protected Query  
**Access:** All authenticated users

Get the latest depreciation record for a device.

**Input:** `number` (device ID)

**Output:**
```typescript
{
  id: number;
  deviceId: number;
  originalPrice: Decimal;
  expectedLifetimeYears: number;
  annualDepreciation: Decimal;
  calculationDate: Date;
  currentBookValue: Decimal;
  depreciationPercentage: Decimal;
  createdAt: Date;
}
```

---

### `depreciation.calculate`

**Type:** Admin Mutation  
**Access:** Admin only

Recalculate depreciation for a device.

**Input:** `number` (device ID)

**Output:** Depreciation record (same as `getByDevice`)

---

## Dashboard Router

### `dashboard.stats`

**Type:** Admin Query  
**Access:** Admin only

Get overall system statistics.

**Input:** None

**Output:**
```typescript
{
  totalDevices: number;
  working: number;
  maintenance: number;
  outOfService: number;
}
```

---

### `dashboard.devicesByStatus`

**Type:** Admin Query  
**Access:** Admin only

Get device count breakdown by status.

**Input:** None

**Output:**
```typescript
{
  status: string;
  count: number;
}[]
```

---

### `dashboard.maintenanceAlerts`

**Type:** Unit Manager Query  
**Access:** Admin, Unit Manager

Get pending maintenance requests.

**Input:** None

**Output:** MaintenanceRequest[]

---

### `dashboard.endOfLifeAlerts`

**Type:** Admin Query  
**Access:** Admin only

Get devices approaching end-of-life (book value < 5% of original).

**Input:** None

**Output:**
```typescript
{
  deviceId: string;
  name: string;
  bookValue: number;
  percentage: number;
}[]
```

---

## Audit Router

### `audit.list`

**Type:** Admin Query  
**Access:** Admin only

Get audit logs with optional filtering.

**Input:**
```typescript
{
  entityType?: string; // "device", "transfer", "maintenance"
  entityId?: number;
  limit?: number; // default: 100
  offset?: number; // default: 0
}
```

**Output:**
```typescript
{
  id: number;
  entityType: string;
  entityId: number;
  action: string; // "create", "update", "delete", "approve"
  userId: number;
  oldValues: JSON | null;
  newValues: JSON | null;
  ipAddress: string | null;
  createdAt: Date;
}[]
```

---

## Error Handling

All procedures follow standard tRPC error handling. Common error codes:

| Code | Meaning |
|------|---------|
| `NOT_FOUND` | Resource does not exist |
| `FORBIDDEN` | User lacks required permissions |
| `BAD_REQUEST` | Invalid input data |
| `INTERNAL_SERVER_ERROR` | Server error |

**Example Error Handling:**
```typescript
const { mutate, error } = trpc.devices.create.useMutation({
  onError: (err) => {
    if (err.data?.code === "FORBIDDEN") {
      console.log("You don't have permission to create devices");
    }
  },
});
```

---

## Type Safety

All tRPC procedures are fully typed. Import the `AppRouter` type for end-to-end type safety:

```typescript
import type { AppRouter } from "../server/routers";

// Types are automatically inferred
const { data } = trpc.devices.list.useQuery({
  facultyId: 1, // Type-safe
});
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. For production deployments, consider adding rate limiting middleware.

---

## Versioning

The API is currently at **version 1.0**. Breaking changes will increment the major version number.

---

**Last Updated:** January 26, 2026  
**Version:** 1.0  
**System:** BUA Smart Unit for Lab Equipment Management

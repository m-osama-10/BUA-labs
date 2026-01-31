import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import * as db from "./db";
import { getPharmacyStats, getPharmacyDevicesData } from "./_core/pharmacy-devices";

// ============================================================================
// PROCEDURE HELPERS
// ============================================================================

/**
 * Admin-only procedure - requires admin role
 */
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

/**
 * Unit Manager procedure - requires admin or unit_manager role
 */
const unitManagerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "unit_manager") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Unit Manager access required",
    });
  }
  return next({ ctx });
});

/**
 * Technician procedure - requires technician, unit_manager, or admin role
 */
const technicianProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (
    ctx.user.role !== "admin" &&
    ctx.user.role !== "unit_manager" &&
    ctx.user.role !== "technician"
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Technician access required",
    });
  }
  return next({ ctx });
});

// ============================================================================
// DEVICE ROUTER
// ============================================================================

const deviceRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        facultyId: z.number().optional(),
        departmentId: z.number().optional(),
        laboratoryId: z.number().optional(),
        status: z.enum(["working", "under_maintenance", "out_of_service"]).optional(),
        category: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      let devices = [];
      let allDevices = [];
      
      try {
        // Get devices from database
        devices = await db.listDevices({
          facultyId: input.facultyId,
          departmentId: input.departmentId,
          laboratoryId: input.laboratoryId,
          status: input.status,
          category: input.category,
          limit: input.limit,
          offset: input.offset,
        });
        
        // Get total count for pagination
        allDevices = await db.listDevices({
          facultyId: input.facultyId,
          departmentId: input.departmentId,
          laboratoryId: input.laboratoryId,
          status: input.status,
          category: input.category,
        });
      } catch (error) {
        console.error("Database error:", error);
        // Fallback to pharmacy devices
        allDevices = getPharmacyDevicesData();
        devices = allDevices.slice(input.offset, input.offset + input.limit);
      }
      
      // If no devices found, use pharmacy devices as fallback
      if (!devices || devices.length === 0) {
        allDevices = getPharmacyDevicesData();
        devices = allDevices.slice(input.offset, input.offset + input.limit);
      }
      
      const total = allDevices.length;
      
      return {
        items: devices,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {
      // Get from database
      const device = await db.getDeviceById(input);
      if (device) {
        return device;
      }
      
      // Fallback to pharmacy devices (for development)
      try {
        const pharmacyDevices = getPharmacyDevicesData();
        const pharmacyDevice = pharmacyDevices.find(d => d.id === input);
        if (pharmacyDevice) {
          return pharmacyDevice;
        }
      } catch (error) {
        console.log("Pharmacy devices not available");
      }
      
      // If device not found anywhere, return a more helpful error
      throw new TRPCError({ 
        code: "NOT_FOUND", 
        message: `Device with ID ${input} not found in database. Please check the device ID or create the device first.` 
      });
    }),

  getByDeviceId: protectedProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const device = await db.getDeviceByDeviceId(input);
      if (!device) throw new TRPCError({ code: "NOT_FOUND" });
      return device;
    }),

  getPublic: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      // Try database first with full hierarchy data
      const device = await db.getDeviceWithHierarchyByQRToken(input);
      if (device) {
        console.log(`✓ QR Device Found: ${device.name}, Dept: ${device.departmentName}`);
        return device;
      }
      
      // Fallback to pharmacy devices
      const pharmacyDevices = getPharmacyDevicesData();
      const pharmacyDevice = pharmacyDevices.find(d => d.qrCodeToken === input);
      if (pharmacyDevice) {
        console.log(`⚠️ Using fallback pharmacy device: ${pharmacyDevice.name}`);
        return pharmacyDevice;
      }
      
      throw new TRPCError({ code: "NOT_FOUND", message: "جهاز غير موجود" });
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        brand: z.string().optional(),
        category: z.string().min(1),
        currentLaboratoryId: z.number(),
        currentDepartmentId: z.number(),
        currentFacultyId: z.number(),
        purchaseDate: z.date(),
        purchasePrice: z.string(),
        expectedLifetimeYears: z.number().min(1),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Generate immutable device ID and QR token
      const year = new Date().getFullYear();
      const faculty = await db.getFacultyById(input.currentFacultyId);
      const facultyCode = faculty?.code || "UNK";
      const deviceId = `DEV-${facultyCode}-${year}-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`;
      const qrCodeToken = nanoid();

      const id = await db.createDevice({
        ...input,
        deviceId,
        qrCodeToken,
        currentStatus: "working",
        createdBy: ctx.user.id,
      });

      // Log audit trail
      await db.createAuditLog({
        entityType: "device",
        entityId: id,
        action: "create",
        userId: ctx.user.id,
        newValues: { deviceId, name: input.name, category: input.category },
      });

      return { id, deviceId, qrCodeToken };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        category: z.string().optional(),
        currentStatus: z.enum(["working", "under_maintenance", "out_of_service"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;
      const device = await db.getDeviceById(id);
      if (!device) throw new TRPCError({ code: "NOT_FOUND" });

      await db.updateDevice(id, updateData);

      // Log audit trail
      await db.createAuditLog({
        entityType: "device",
        entityId: id,
        action: "update",
        userId: ctx.user.id,
        oldValues: device,
        newValues: updateData,
      });

      return { success: true };
    }),
});

// ============================================================================
// TRANSFER ROUTER
// ============================================================================

const transferRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        deviceId: z.number().optional(),
        facultyId: z.number().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return await db.listTransfers(input);
    }),

  getHistory: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await db.getTransfersByDevice(input);
    }),

  create: unitManagerProcedure
    .input(
      z.object({
        deviceId: z.number(),
        fromLaboratoryId: z.number(),
        fromDepartmentId: z.number(),
        toLaboratoryId: z.number(),
        toDepartmentId: z.number(),
        fromFacultyId: z.number(),
        toFacultyId: z.number(),
        transferDate: z.date(),
        reason: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const device = await db.getDeviceById(input.deviceId);
      if (!device) throw new TRPCError({ code: "NOT_FOUND" });

      // Validate target laboratory exists
      const targetLab = await db.getLaboratoryById(input.toLaboratoryId);
      if (!targetLab) {
        throw new TRPCError({ 
          code: "NOT_FOUND",
          message: "Target laboratory not found"
        });
      }

      // Validate target department exists
      const targetDept = await db.getDepartmentById(input.toDepartmentId);
      if (!targetDept) {
        throw new TRPCError({ 
          code: "NOT_FOUND",
          message: "Target department not found"
        });
      }

      const id = (await db.createTransfer({
        ...input,
        createdBy: ctx.user.id,
      })) as any;

      // Log audit trail
      await db.createAuditLog({
        entityType: "transfer",
        entityId: id,
        action: "create",
        userId: ctx.user.id,
        newValues: input,
      });

      return { id, success: true };
    }),

  approve: unitManagerProcedure
    .input(
      z.object({
        transferId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Fetch the transfer record
      const transfer = await db.getTransferById(input.transferId);
      if (!transfer) throw new TRPCError({ code: "NOT_FOUND", message: "Transfer not found" });

      // Get the device
      const device = await db.getDeviceById(transfer.deviceId);
      if (!device) throw new TRPCError({ code: "NOT_FOUND", message: "Device not found" });

      // Update device location to new location (Transfer already updated it in create)
      // Just mark the transfer as approved
      await db.updateTransfer(input.transferId, {
        approvedBy: ctx.user.id,
        approvalDate: new Date(),
      });

      // Log audit trail
      await db.createAuditLog({
        entityType: "transfer",
        entityId: input.transferId,
        action: "approve",
        userId: ctx.user.id,
        newValues: { approvedBy: ctx.user.id, approvalDate: new Date() },
      });

      return { success: true, message: "Transfer approved successfully" };
    }),
});

// ============================================================================
// MAINTENANCE ROUTER
// ============================================================================

const maintenanceRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        assignedTo: z.number().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const items = await db.listMaintenanceRequests(input);
      return { items, total: items.length };
    }),

  getHistory: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await db.getMaintenanceHistoryByDevice(input);
    }),

  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await db.getMaintenanceById(input);
    }),

  create: protectedProcedure
    .input(
      z.object({
        deviceId: z.number(),
        maintenanceType: z.enum(["periodic", "emergency"]),
        scheduledDate: z.date().optional(),
        notes: z.string().optional(),
        currentIssue: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      let device = await db.getDeviceById(input.deviceId);

      // If device not found in DB, try pharmacy devices (dev mode) and create DB record
      if (!device) {
        const pharmacyDevices = getPharmacyDevicesData();
        const pharma = pharmacyDevices.find((d) => d.id === input.deviceId || d.deviceId === String(input.deviceId));
        if (pharma) {
          // create device record in DB from pharmacy data
          const createdId = await db.createDevice({
            deviceId: pharma.deviceId,
            name: pharma.name,
            brand: pharma.brand || undefined,
            category: pharma.category || "Equipment",
            currentLaboratoryId: pharma.currentLaboratoryId || 1,
            currentDepartmentId: pharma.currentDepartmentId || 1,
            currentFacultyId: pharma.currentFacultyId || 1,
            purchaseDate: pharma.purchaseDate ? new Date(pharma.purchaseDate) : new Date(),
            purchasePrice: pharma.purchasePrice || "0",
            expectedLifetimeYears: pharma.expectedLifetimeYears || 5,
            currentStatus: (pharma.currentStatus as any) || "working",
            notes: pharma.notes || "",
            qrCodeToken: pharma.qrCodeToken || nanoid(),
            createdBy: ctx.user.id,
          });

          device = await db.getDeviceById(createdId as number);
        }
      }

      if (!device) throw new TRPCError({ code: "NOT_FOUND" });

      const id = (await db.createMaintenanceRequest({
        ...input,
        requestedBy: ctx.user.id,
        createdBy: ctx.user.id,
      })) as any;

      // Log audit trail
      await db.createAuditLog({
        entityType: "maintenance",
        entityId: id,
        action: "create",
        userId: ctx.user.id,
        newValues: input,
      });

      return { id, success: true };
    }),

  approve: unitManagerProcedure
    .input(
      z.object({
        requestId: z.number(),
        assignedTo: z.number(),
        scheduledDate: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db.approveMaintenanceRequest(
        input.requestId,
        input.assignedTo,
        input.scheduledDate
      );

      // Log audit trail
      await db.createAuditLog({
        entityType: "maintenance",
        entityId: input.requestId,
        action: "approve",
        userId: ctx.user.id,
        newValues: input,
      });

      return { success: true };
    }),

  complete: technicianProcedure
    .input(
      z.object({
        requestId: z.number(),
        cost: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db.completeMaintenanceRequest(
        input.requestId,
        input.cost,
        input.notes
      );

      // Log audit trail
      await db.createAuditLog({
        entityType: "maintenance",
        entityId: input.requestId,
        action: "complete",
        userId: ctx.user.id,
        newValues: input,
      });

      return { success: true };
    }),
});

// ============================================================================
// HIERARCHY ROUTER
// ============================================================================

const hierarchyRouter = router({
  faculties: publicProcedure.query(async () => {
    return await db.getFaculties();
  }),

  departments: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await db.getDepartmentsByFaculty(input);
    }),

  getAllDepartments: publicProcedure.query(async () => {
    return await db.getAllDepartments();
  }),

  laboratories: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await db.getLaboratoriesByDepartment(input);
    }),

  getAllLaboratories: publicProcedure.query(async () => {
    return await db.getAllLaboratories();
  }),
});

// ============================================================================
// DEPRECIATION ROUTER
// ============================================================================

const depreciationRouter = router({
  getByDevice: protectedProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await db.getDepreciationByDevice(input);
    }),

  calculate: adminProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      const device = await db.getDeviceById(input);
      if (!device) throw new TRPCError({ code: "NOT_FOUND" });

      const depreciation = await db.calculateDepreciation(device);
      return depreciation;
    }),
});

// ============================================================================
// DASHBOARD ROUTER
// ============================================================================

const dashboardRouter = router({
  stats: publicProcedure.query(async () => {
    // First try to get real data from database
    try {
      const devices = await db.listDevices({ limit: 10000 });
      if (devices && devices.length > 0) {
        return {
          totalDevices: devices.length,
          working: devices.filter((d: any) => d.currentStatus === "working").length,
          maintenance: devices.filter((d: any) => d.currentStatus === "under_maintenance").length,
          outOfService: devices.filter((d: any) => d.currentStatus === "out_of_service").length,
        };
      }
    } catch (err) {
      console.warn("Failed to get devices from database:", err);
    }
    
    // Fallback to pharmacy devices data for development
    return getPharmacyStats();
  }),

  devicesByStatus: adminProcedure.query(async () => {
    try {
      const devices = await db.listDevices({ limit: 10000 });
      if (devices && devices.length > 0) {
        const working = devices.filter((d: any) => d.currentStatus === "working").length;
        const maintenance = devices.filter((d: any) => d.currentStatus === "under_maintenance").length;
        const outOfService = devices.filter((d: any) => d.currentStatus === "out_of_service").length;
        return [
          { status: "working", count: working },
          { status: "under_maintenance", count: maintenance },
          { status: "out_of_service", count: outOfService },
        ];
      }
    } catch (err) {
      console.warn("Failed to get device statuses:", err);
    }

    // Fallback
    const pharmacyDevices = getPharmacyDevicesData();
    const working = pharmacyDevices.filter((d: any) => d.currentStatus === "working").length;
    const maintenance = pharmacyDevices.filter((d: any) => d.currentStatus === "under_maintenance").length;
    const outOfService = pharmacyDevices.filter((d: any) => d.currentStatus === "out_of_service").length;
    return [
      { status: "working", count: working },
      { status: "under_maintenance", count: maintenance },
      { status: "out_of_service", count: outOfService },
    ];
  }),

  maintenanceAlerts: unitManagerProcedure.query(async () => {
    try {
      const maintenanceList = await db.listMaintenanceRequests({ limit: 100 });
      return maintenanceList.filter((m: any) => m.status !== "completed");
    } catch (err) {
      return [];
    }
  }),

  endOfLifeAlerts: adminProcedure.query(async () => {
    try {
      const devices = await db.listDevices({ limit: 10000 });
      const alerts = [];

      for (const device of devices) {
        if (
          device.purchaseDate &&
          device.expectedLifetimeYears
        ) {
          const purchaseDate = new Date(device.purchaseDate);
          const endDate = new Date(
            purchaseDate.getFullYear() + device.expectedLifetimeYears,
            purchaseDate.getMonth(),
            purchaseDate.getDate()
          );
          const now = new Date();
          const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          if (daysLeft < 365 && daysLeft > 0) {
            const percentage = Math.round(
              ((now.getTime() - purchaseDate.getTime()) /
                (endDate.getTime() - purchaseDate.getTime())) *
              100
            );
            const bookValue =
              parseFloat(String(device.purchasePrice)) * (1 - percentage / 100);

            alerts.push({
              deviceId: device.deviceId,
              name: device.name,
              bookValue: bookValue.toFixed(2),
              percentage,
            });
          }
        }
      }

      return alerts;
    } catch (err) {
      return [];
    }
  }),
});

// ============================================================================
// REPORTS ROUTER
// ============================================================================

const reportsRouter = router({
  devicesByCategory: protectedProcedure.query(async () => {
    let devices = [] as any[];
    try {
      devices = await db.listDevices({ limit: 10000 });
    } catch (err) {
      devices = [];
    }

    if (!devices || devices.length === 0) {
      devices = getPharmacyDevicesData();
    }

    const map: Record<string, number> = {};
    for (const d of devices) {
      const key = (d.category || "Uncategorized").toString();
      map[key] = (map[key] || 0) + 1;
    }
    return Object.entries(map).map(([category, count]) => ({ category, count }));
  }),

  devicesByFaculty: protectedProcedure.query(async () => {
    let devices = [] as any[];
    try {
      devices = await db.listDevices({ limit: 10000 });
    } catch (err) {
      devices = [];
    }

    const faculties = await db.getFaculties();
    const map: Record<number, number> = {};
    for (const d of devices) {
      const fid = d.currentFacultyId || 0;
      map[fid] = (map[fid] || 0) + 1;
    }

    if (faculties && faculties.length > 0) {
      return faculties.map((f: any) => ({ facultyId: f.id, facultyName: f.name, count: map[f.id] || 0 }));
    }

    // Fallback: return counts grouped by faculty id with generated names
    const ids = Object.keys(map).map((s) => Number(s));
    return ids.map((id) => ({ facultyId: id, facultyName: `Faculty ${id}`, count: map[id] || 0 }));
  }),

  deviceTypeCount: protectedProcedure
    .input(z.object({ term: z.string() }))
    .query(async ({ input }) => {
      const term = input.term.toLowerCase();
      let devices = [] as any[];
      try {
        devices = await db.listDevices({ limit: 10000 });
      } catch (err) {
        devices = [];
      }

      if (!devices || devices.length === 0) devices = getPharmacyDevicesData();

      const count = devices.filter((d) => {
        const cat = (d.category || "").toString().toLowerCase();
        const name = (d.name || "").toString().toLowerCase();
        return cat.includes(term) || name.includes(term);
      }).length;
      return { term: input.term, count };
    }),

  topBrands: protectedProcedure.query(async () => {
    let devices = [] as any[];
    try {
      devices = await db.listDevices({ limit: 10000 });
    } catch (err) {
      devices = [];
    }

    if (!devices || devices.length === 0) devices = getPharmacyDevicesData();

    const freq: Record<string, number> = {};
    for (const d of devices) {
      // Use brand field, fallback to category or "Unknown"
      const brand = (d.brand || d.category || "Unknown").toString();
      const key = brand.replace(/[^a-zA-Z0-9\u0600-\u06FF\-]/g, "") || "Unknown";
      freq[key] = (freq[key] || 0) + 1;
    }
    const arr = Object.entries(freq)
      .map(([brand, count]) => ({ brand: brand || "Unknown", count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    return arr;
  }),
});

// ============================================================================
// AUDIT LOG ROUTER
// ============================================================================

const auditRouter = router({
  list: adminProcedure
    .input(
      z.object({
        entityType: z.string().optional(),
        entityId: z.number().optional(),
        limit: z.number().default(100),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return await db.getAuditLogs(input);
    }),
});

// ============================================================================
// IMPORT/EXPORT ROUTER
// ============================================================================

const importExportRouter = router({
  exportDevices: protectedProcedure.mutation(async () => {
    const { exportDevicesToCSV } = await import("./_core/exportImport");
    const csv = await exportDevicesToCSV();
    return { csv, filename: `devices-${new Date().toISOString().split("T")[0]}.csv` };
  }),
  exportFaculties: protectedProcedure.mutation(async () => {
    const { exportFacultiesToCSV } = await import("./_core/exportImport");
    const csv = await exportFacultiesToCSV();
    return { csv, filename: `faculties-${new Date().toISOString().split("T")[0]}.csv` };
  }),
  exportDepartments: protectedProcedure.mutation(async () => {
    const { exportDepartmentsToCSV } = await import("./_core/exportImport");
    const csv = await exportDepartmentsToCSV();
    return { csv, filename: `departments-${new Date().toISOString().split("T")[0]}.csv` };
  }),
  exportLaboratories: protectedProcedure.mutation(async () => {
    const { exportLaboratoriesToCSV } = await import("./_core/exportImport");
    const csv = await exportLaboratoriesToCSV();
    return { csv, filename: `laboratories-${new Date().toISOString().split("T")[0]}.csv` };
  }),
  exportTransfers: protectedProcedure.mutation(async () => {
    const { exportTransfersToCSV } = await import("./_core/exportImport");
    const csv = await exportTransfersToCSV();
    return { csv, filename: `transfers-${new Date().toISOString().split("T")[0]}.csv` };
  }),
  exportMaintenance: protectedProcedure.mutation(async () => {
    const { exportMaintenanceToCSV } = await import("./_core/exportImport");
    const csv = await exportMaintenanceToCSV();
    return { csv, filename: `maintenance-${new Date().toISOString().split("T")[0]}.csv` };
  }),
  exportAuditLogs: protectedProcedure.mutation(async () => {
    const { exportAuditLogsToCSV } = await import("./_core/exportImport");
    const csv = await exportAuditLogsToCSV();
    return { csv, filename: `audit-logs-${new Date().toISOString().split("T")[0]}.csv` };
  }),
  exportAll: protectedProcedure.mutation(async () => {
    const { generateCompleteExport } = await import("./_core/exportImport");
    const exports = await generateCompleteExport();
    return {
      exports,
      timestamp: new Date().toISOString().split("T")[0],
    };
  }),
  importDevices: protectedProcedure
    .input(z.object({ csvContent: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { importDevicesFromCSV } = await import("./_core/exportImport");
      const result = await importDevicesFromCSV(input.csvContent, ctx.user.id);
      return result;
    }),
});

// ============================================================================
// MAIN ROUTER
// ============================================================================

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => {
      // In development mode, check if this is a dev login
      if (opts.ctx.user) {
        console.log("[Auth.me] User found:", opts.ctx.user.openId);
        return opts.ctx.user;
      }
      // Return null for unauthenticated users
      console.log("[Auth.me] No user found");
      return null;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    // Admin: create new user
    createUser: adminProcedure
      .input(
        z.object({
          email: z.string().email(),
          name: z.string().min(2),
          role: z.enum(["admin", "unit_manager", "technician", "user"]),
        })
      )
      .mutation(async ({ input }) => {
        // generate a stable openId for local users
        const openId = `local-${nanoid()}`;

        await db.upsertUser({
          openId,
          name: input.name,
          email: input.email,
          role: input.role,
          loginMethod: "local",
          lastSignedIn: new Date(),
        });

        const created = await db.getUserByOpenId(openId);
        return created ?? null;
      }),

    // Admin: update existing user
    updateUser: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(2).optional(),
          email: z.string().email().optional(),
          role: z.enum(["admin", "unit_manager", "technician", "user"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const updated = await db.updateUser(input.id, {
          name: input.name,
          email: input.email,
          role: input.role,
        });
        return updated ?? null;
      }),
  }),

  // Feature routers
  devices: deviceRouter,
  transfers: transferRouter,
  maintenance: maintenanceRouter,
  hierarchy: hierarchyRouter,
  depreciation: depreciationRouter,
  dashboard: dashboardRouter,
  reports: reportsRouter,
  audit: auditRouter,
  importExport: importExportRouter,
  users: router({
    list: adminProcedure.query(async () => {
      return await db.listUsers();
    }),
  }),
});

export type AppRouter = typeof appRouter;

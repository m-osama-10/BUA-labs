import XLSX from "xlsx";

const filePath = "C:\\Users\\MOsam\\Downloads\\Pharmacy Devices and Report.xlsx";

export function getPharmacyDevicesData() {
  try {
    const workbook = XLSX.readFile(filePath);
    const deviceSheet = workbook.Sheets["All Devices List "];
    const devicesData = XLSX.utils.sheet_to_json(deviceSheet) as any[];
    
    return devicesData.map((device, index) => {
      // Safe string conversion for all fields
      const safeStr = (val: any) => {
        if (val === null || val === undefined) return "";
        return String(val).trim();
      };
      
      const statusRaw = safeStr(device["Status "]).toLowerCase();
      const isWorking = statusRaw === "working";
      const isNotWorking = statusRaw === "not working" || statusRaw === "not_working";
      
      return {
        id: index + 1,
        deviceId: safeStr(device["Device ID"]).replace(/\s+/g, "-") || `DEV-${index}`,
        name: safeStr(device["Device Name"]) || "Unknown Device",
        category: safeStr(device["Device Name"]) || "Equipment",
        brand: safeStr(device["Brand"]),
        model: safeStr(device["Model "]),
        currentLaboratoryId: 1,
        currentDepartmentId: 1,
        currentFacultyId: 1,
        department: safeStr(device["Department"]),
        location: safeStr(device["Location "]),
        purchaseDate: new Date(),
        purchasePrice: "0",
        expectedLifetimeYears: 5,
        currentStatus: isNotWorking ? "out_of_service" : "working",
        currentIssue: isNotWorking ? "Device not working" : null,
        qrCodeToken: `token-${index}`,
        createdBy: 999,
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: safeStr(device["Notes "]),
      };
    });
  } catch (error) {
    console.error("[Pharmacy Devices] Failed to load:", error);
    return [];
  }
}

export function getPharmacyStats() {
  const data = getPharmacyDevicesData();
  
  const working = data.filter(d => d.currentStatus === "working").length;
  const maintenance = data.filter(d => d.currentStatus === "under_maintenance").length;
  const outOfService = data.filter(d => d.currentStatus === "out_of_service").length;
  
  return {
    totalDevices: data.length,
    working,
    maintenance,
    outOfService,
  };
}

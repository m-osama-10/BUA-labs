import * as fs from "fs";
import * as path from "path";
import XLSX from "xlsx";

/**
 * Script to read and parse Excel files
 * Usage: node read-excel.mjs <file-path>
 */

const filePath = process.argv[2] || "C:\\Users\\MOsam\\Downloads\\Pharmacy Devices and Report.xlsx";

try {
  console.log("📖 Reading Excel file...");
  
  // Read the file
  const workbook = XLSX.readFile(filePath);
  
  console.log("\n📋 Available sheets:", workbook.SheetNames);
  
  // Get the "All Devices List" sheet
  const deviceSheet = workbook.Sheets["All Devices List "];
  
  // Convert to JSON
  const data = XLSX.utils.sheet_to_json(deviceSheet);
  
  console.log("\n📊 Total devices:", data.length);
  console.log("\n🔍 First 5 rows:");
  console.log(JSON.stringify(data.slice(0, 5), null, 2));
  
  console.log("\n📋 Column names:");
  if (data.length > 0) {
    console.log(Object.keys(data[0]));
  }
  
} catch (error) {
  console.error("❌ Error:", error);
}

import XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const excelPath = 'C:\\Users\\MOsam\\Downloads\\Pharmacy Devices and Report.xlsx';

try {
  console.log(`\n📂 Reading Excel file: ${excelPath}\n`);
  
  // Check if file exists
  if (!fs.existsSync(excelPath)) {
    console.error(`❌ File not found: ${excelPath}`);
    process.exit(1);
  }

  // Read workbook
  const workbook = XLSX.readFile(excelPath);
  
  console.log(`📑 Available sheets: ${workbook.SheetNames.join(', ')}\n`);

  // Process each sheet
  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`\n📋 Sheet: "${sheetName}"`);
    console.log(`   Rows: ${data.length}`);
    
    if (data.length > 0) {
      console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
      console.log(`\n   First 3 rows:`);
      data.slice(0, 3).forEach((row, idx) => {
        console.log(`   ${idx + 1}: ${JSON.stringify(row)}`);
      });
    }
  });

} catch (error) {
  console.error('❌ Error reading Excel file:', error);
  process.exit(1);
}

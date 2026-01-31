import XLSX from 'xlsx';

const EXCEL_FILE = 'C:\\Users\\MOsam\\Downloads\\Pharmacy Devices and Report.xlsx';

try {
  const workbook = XLSX.readFile(EXCEL_FILE);
  const sheetName = workbook.SheetNames[0];
  console.log('Sheet name:', sheetName);
  
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  // Show headers
  if (data.length > 0) {
    console.log('\nColumn headers:');
    console.log(Object.keys(data[0]));
    
    console.log('\nFirst 3 rows:');
    data.slice(0, 3).forEach((row, i) => {
      console.log(`\nRow ${i + 1}:`);
      Object.entries(row).forEach(([key, val]) => {
        console.log(`  ${key}: ${val}`);
      });
    });
  }
} catch (err) {
  console.error('Error:', err);
}

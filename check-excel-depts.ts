import XLSX from 'xlsx';

const EXCEL_FILE = 'C:\\Users\\MOsam\\Downloads\\Pharmacy Devices and Report.xlsx';

try {
  const workbook = XLSX.readFile(EXCEL_FILE);
  const sheet = workbook.Sheets['All Devices List '];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  // Get unique departments from Excel
  const departments = new Set(data.map((row: any) => row.Department).filter(Boolean));
  
  console.log('Unique departments in Excel:');
  Array.from(departments).sort().forEach((dept: any) => {
    const count = data.filter((r: any) => r.Department === dept).length;
    console.log(`  "${dept}": ${count} devices`);
  });
  
} catch (err) {
  console.error('Error:', err);
}

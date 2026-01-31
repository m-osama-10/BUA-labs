import XLSX from 'xlsx';

const EXCEL_FILE = 'C:\\Users\\MOsam\\Downloads\\Pharmacy Devices and Report.xlsx';

try {
  const workbook = XLSX.readFile(EXCEL_FILE);
  
  console.log('Available sheets:');
  workbook.SheetNames.forEach((name, idx) => {
    console.log(`${idx}: "${name}"`);
  });
  
  // Try to find the device list sheet
  let deviceSheet = workbook.Sheets['All Devices List '] || 
                    workbook.Sheets['All Devices List'] ||
                    workbook.Sheets['Devices'];
  
  if (!deviceSheet) {
    // Try first sheet with more than 10 rows
    for (const name of workbook.SheetNames) {
      const sheet = workbook.Sheets[name];
      const data = XLSX.utils.sheet_to_json(sheet);
      if (data.length > 10) {
        console.log(`\nUsing sheet: "${name}" (${data.length} rows)`);
        deviceSheet = sheet;
        break;
      }
    }
  }
  
  if (deviceSheet) {
    const data = XLSX.utils.sheet_to_json(deviceSheet);
    console.log(`\nSheet has ${data.length} rows`);
    
    if (data.length > 0) {
      console.log('\nColumn headers:');
      console.log(Object.keys(data[0]));
      
      console.log('\nFirst 2 device rows:');
      data.slice(0, 2).forEach((row, i) => {
        console.log(`\nRow ${i + 1}:`);
        Object.entries(row).forEach(([key, val]) => {
          if (val) console.log(`  ${key}: ${val}`);
        });
      });
    }
  }
} catch (err) {
  console.error('Error:', err);
}

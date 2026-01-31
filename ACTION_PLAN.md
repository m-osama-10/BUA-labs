# خطة العمل: إصلاح المشاكل المتبقية

## 📋 الأولويات

### 🔴 الأولوية 1: الأمان (Security)
**المدة المتوقعة:** 2-3 ساعات

#### المهمة 1.1: تحضير ملف .env
```bash
# 1. إنشاء .env.example
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=bua_assets
EXCEL_FILE_PATH=./data/devices.xlsx
NODE_ENV=development
```

#### المهمة 1.2: تحديث ملفات الاتصال (12 ملف)
```typescript
// القالب المقترح:
const conn = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'bua_assets',
});
```

**الملفات المطلوب تحديثها:**
1. `import-excel-devices.ts` - سطر 67
2. `add-missing-labs.ts` - سطر 10
3. `verify-database.ts` - سطر 8
4. `show-device-stats.ts` - سطر 7
5. `server/utils/generate-device-id.ts` - سطر 112
6. `run-sql-setup.ts` - سطر 14
7. `import-devices.ts` - سطر 26
8. `get-laboratories.ts` - سطر 7
9. `create-test-user.ts` - سطر 7
10. `create-all-tables.ts` - سطر 13
11. `check-devices-location.ts` - سطر 7
12. `add-pharmacy-departments.ts` - سطر 11

#### المهمة 1.3: تحديث مسارات الملفات (7 ملفات)
```typescript
// القالب المقترح:
import * as path from 'path';

const excelPath = process.env.EXCEL_FILE_PATH || 
  path.join(process.cwd(), 'data', 'devices.xlsx');
```

**الملفات المطلوب تحديثها:**
1. `parse-excel-devices.ts` - سطر 4
2. `import-excel-devices.ts` - سطر 6
3. `add-missing-labs.ts` - سطر 4
4. `server/_core/pharmacy-devices.ts` - سطر 3
5. `read-excel.mjs` - سطر 10
6. `read-excel-devices.ts` - سطر 5
7. `import-pharmacy-devices.ts` - سطر 12

---

### 🟡 الأولوية 2: جودة الكود (Code Quality)
**المدة المتوقعة:** 4-5 ساعات

#### المهمة 2.1: إنشاء Excel Reader Utility
**الملف الجديد:** `server/utils/excel-reader.ts`

```typescript
import XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface ExcelReadOptions {
  filePath: string;
  sheetName?: string;
}

export async function readExcelDevices(options: ExcelReadOptions) {
  const { filePath, sheetName = 'All Devices List ' } = options;

  if (!fs.existsSync(filePath)) {
    throw new Error(`Excel file not found: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets[sheetName];
  
  if (!worksheet) {
    throw new Error(`Sheet not found: ${sheetName}`);
  }

  return XLSX.utils.sheet_to_json(worksheet);
}

export async function getExcelSheetNames(filePath: string): Promise<string[]> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Excel file not found: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath);
  return workbook.SheetNames;
}
```

#### المهمة 2.2: إنشاء Database Connection Utility
**الملف الجديد:** `server/utils/db-utils.ts`

```typescript
import mysql from 'mysql2/promise';

interface DbConnectionConfig {
  host?: string;
  user?: string;
  password?: string;
  database?: string;
}

export async function createDbConnection(
  config?: Partial<DbConnectionConfig>
): Promise<mysql.Connection> {
  const finalConfig = {
    host: config?.host || process.env.DB_HOST || 'localhost',
    user: config?.user || process.env.DB_USER || 'root',
    password: config?.password || process.env.DB_PASSWORD,
    database: config?.database || process.env.DB_NAME || 'bua_assets',
  };

  if (!finalConfig.password) {
    throw new Error('DB_PASSWORD environment variable is required');
  }

  return await mysql.createConnection(finalConfig);
}

export async function withDbConnection<T>(
  callback: (conn: mysql.Connection) => Promise<T>
): Promise<T> {
  const conn = await createDbConnection();
  try {
    return await callback(conn);
  } finally {
    await conn.end();
  }
}
```

#### المهمة 2.3: تحديث الملفات لاستخدام الـ Utilities
**الملفات المطلوب تحديثها:**
- جميع 12 ملف اتصال قاعدة البيانات
- جميع 7 ملفات قراءة Excel

---

### 🟢 الأولوية 3: التطوير والتحسين
**المدة المتوقعة:** 3-4 ساعات

#### المهمة 3.1: إضافة Error Handling موحد
**الملف الجديد:** `server/_core/error-handler.ts`

```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public context?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, context?: any) {
    super(500, `Database Error: ${message}`, context);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: any) {
    super(400, `Validation Error: ${message}`, context);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}
```

#### المهمة 3.2: إضافة Logging موحد
**الملف الجديد:** `server/_core/logger.ts`

```typescript
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: LogLevel, message: string): string {
    return `[${new Date().toISOString()}] [${level}] [${this.context}] ${message}`;
  }

  error(message: string, error?: Error): void {
    console.error(this.formatMessage(LogLevel.ERROR, message), error);
  }

  warn(message: string): void {
    console.warn(this.formatMessage(LogLevel.WARN, message));
  }

  info(message: string): void {
    console.log(this.formatMessage(LogLevel.INFO, message));
  }

  debug(message: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage(LogLevel.DEBUG, message));
    }
  }
}
```

---

## 📊 خطة التنفيذ الزمنية

```
أسبوع 1:
├─ الأثنين: المهام 1.1 و 1.2
├─ الثلاثاء: المهمة 1.3
├─ الأربعاء: المهام 2.1 و 2.2
├─ الخميس: المهمة 2.3
└─ الجمعة: اختبار شامل

أسبوع 2:
├─ الأثنين: المهام 3.1 و 3.2
├─ الثلاثاء-الخميس: تطبيق وتحديث الملفات
└─ الجمعة: مراجعة نهائية والاختبار
```

---

## ✅ معايير النجاح

- [ ] جميع أخطاء TypeScript تم حلها ✅ (تم)
- [ ] لا توجد كلمات مرور في الكود
- [ ] لا توجد مسارات ثابتة
- [ ] كود موحد وقابل للصيانة
- [ ] جميع الملفات تعمل بنجاح
- [ ] الاختبارات تعمل بدون أخطاء

---

## 🔍 نقاط الفحص

```
قبل الالتزام (Before Commit):
├─ npm run check (TypeScript)
├─ npm run test (Unit Tests)
├─ npm run lint (Code Quality)
└─ npm run build (Final Build)

بعد الالتزام:
├─ التحقق من عدم وجود secrets
├─ اختبار على بيئة جديدة
└─ مراجعة الأداء
```

---

## 📚 المراجع والموارد

- [TypeScript Best Practices](https://www.typescriptlang.org/docs/)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
- [Environmental Variables](https://12factor.net/config)
- [Error Handling in Node.js](https://nodejs.org/en/docs/guides/error-management/)

---

**تم الإنشاء:** 30 يناير 2025
**آخر تحديث:** 30 يناير 2025 - 16:50 GMT+2

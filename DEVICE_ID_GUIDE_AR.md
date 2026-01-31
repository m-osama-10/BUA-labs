# 🏥 Device ID Auto-Generation Guide

## نظام توليد معرّفات الأجهزة التلقائي

### صيغة Device ID

```
FacultyCode + LaboratoryID + DeviceTypeCode + SequenceNumber
```

#### مثال:
```
PHARM1-WB001

PHARM = Faculty Code (الكود الخاص بالكلية)
1     = Laboratory ID (رقم المختبر)
WB    = Device Type Code (كود نوع الجهاز)
001   = Sequence Number (الرقم التسلسلي للجهاز)
```

---

## كيفية استخدام النظام

### 1️⃣ عند إضافة جهاز جديد

عند اختيار جهاز جديد:
- ✅ يتم استخراج **كود الكلية** من الكلية المختارة
- ✅ يتم الحصول على **رقم المختبر** من المختبر المختار
- ✅ يتم استخراج **كود نوع الجهاز** من اسم الجهاز تلقائياً
- ✅ يتم حساب **الرقم التسلسلي** بناءً على آخر جهاز في هذا المختبر

### 2️⃣ أمثلة على كود نوع الجهاز

| اسم الجهاز | الكود |
|-----------|------|
| Water Bath | WB |
| Centrifuge | CF |
| Autoclave | AC |
| Incubator | INC |
| Microscope | MS |
| Spectrophotometer | SP |
| HPLC | HPLC |
| Evaporator | EV |
| Balance | BL |
| Oven | OV |
| Fridge | FR |
| Freezer | FZ |
| Pipette | PP |
| Burette | BU |
| Thermometer | TM |
| pH Meter | PH |
| Stirrer | ST |
| Mixer | MX |
| Shaker | SH |
| Vortex | VX |
| Ultrasonic | US |
| Vacuum Pump | VP |

---

## 📝 أمثلة عملية

### Pharmacy Faculty
```
كلية الصيدلة - المختبر 1 (مختبر الصيدلة الإكلينيكية 1)
PHARM = Faculty Code
1 = Laboratory ID

أول جهاز Water Bath:     PHARM1-WB001
ثاني جهاز Water Bath:    PHARM1-WB002
أول جهاز Centrifuge:    PHARM1-CF001

كلية الصيدلة - المختبر 2 (مختبر الصيدلة الصناعية)
PHARM = Faculty Code
2 = Laboratory ID

أول جهاز Autoclave:     PHARM2-AC001
```

### Dentistry Faculty
```
كلية طب الأسنان - المختبر 4
DENT = Faculty Code
4 = Laboratory ID

أول جهاز Microscope:    DENT4-MS001
```

---

## 🔧 الفوائد

✅ **Uniqueness** - كل جهاز له معرّف فريد لا يمكن تكراره
✅ **Trackability** - يسهل تتبع الجهاز من معرّفه (الكلية، المختبر، النوع)
✅ **Automatic** - يتم التوليد تلقائياً، لا حاجة لإدخال يدوي
✅ **Sequential** - الترقيم التسلسلي يسهل إدارة الأجهزة
✅ **Readable** - صيغة سهلة القراءة والفهم

---

## 📊 Database Schema

```sql
-- Device ID خزّن في جدول devices
CREATE TABLE devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deviceId VARCHAR(100) NOT NULL UNIQUE,  -- توليد تلقائي
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  currentLaboratoryId INT NOT NULL,
  currentDepartmentId INT NOT NULL,
  currentFacultyId INT NOT NULL,
  purchaseDate DATE NOT NULL,
  purchasePrice DECIMAL(12, 2) NOT NULL,
  expectedLifetimeYears INT NOT NULL,
  currentStatus ENUM('working', 'under_maintenance', 'out_of_service'),
  qrCodeToken VARCHAR(100) NOT NULL UNIQUE,  -- لـ QR Code
  ...
);
```

---

## 🚀 الاستخدام في الكود

### في TypeScript
```typescript
import { generateDeviceId } from '@/server/utils/generate-device-id';

// عند إضافة جهاز جديد
const deviceId = await generateDeviceId(
  facultyCode,        // "PHARM"
  laboratoryId,       // 1
  deviceName,         // "Water Bath"
  connection
);

console.log(deviceId); // "PHARM1-WB001"
```

### في tRPC Router
```typescript
// عند استقبال طلب إضافة جهاز
export const createDevice = publicProcedure
  .input(insertDeviceSchema)
  .mutation(async ({ input, ctx }) => {
    const deviceId = await generateDeviceId(
      input.facultyCode,
      input.laboratoryId,
      input.deviceName,
      ctx.db
    );

    const device = await ctx.db.insert(devices).values({
      deviceId,  // تلقائي!
      ...input
    });

    return device;
  });
```

---

## ⚙️ إضافة أنواع أجهزة جديدة

إذا كنت تريد إضافة نوع جهاز جديد، عدّل ملف `server/utils/generate-device-id.ts`:

```typescript
const deviceCodeMap: { [key: string]: string } = {
  'water bath': 'WB',
  'centrifuge': 'CF',
  'autoclave': 'AC',
  'incubator': 'INC',
  // أضف هنا:
  'your device name': 'YD',
};
```

---

## 📞 Support

للمزيد من المساعدة:
```bash
npm run dev
# ثم انتقل إلى صفحة إضافة جهاز جديد
```

🎉 **الآن أنت جاهز لاستخدام نظام توليد Device ID التلقائي!**

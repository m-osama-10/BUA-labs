# 🚀 نشر المشروع على Vercel - Deployment Guide

## المتطلبات

- حساب GitHub
- حساب Vercel
- متغيرات البيئة الصحيحة

---

## خطوات النشر على GitHub

### 1. تهيئة المشروع محلياً
```bash
# تأكد من إنشاء .gitignore
git init
git add .
git commit -m "Initial commit: BUA Asset Management System"
```

### 2. رفع على GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/bua-asset-management.git
git branch -M main
git push -u origin main
```

---

## خطوات النشر على Vercel

### 1. ربط GitHub مع Vercel
- اذهب إلى [vercel.com](https://vercel.com)
- اضغط "Import Project"
- اختر "Import Git Repository"
- اختر المشروع من GitHub

### 2. إضافة متغيرات البيئة

في Vercel Dashboard، اذهب إلى:
**Settings** → **Environment Variables**

أضف المتغيرات التالية:

```
DATABASE_URL=mysql://user:password@host:port/database
NODE_ENV=production
```

### 3. إعدادات البناء
Vercel سيكتشف تلقائياً:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. اضغط Deploy

---

## 📋 الملفات المُضافة للتوافق

### ✅ `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite"
}
```

### ✅ `.npmrc`
```
strict-peer-dependencies=false
shamefully-hoist=true
legacy-peer-deps=true
```

---

## 🔧 حل المشاكل الشائعة

### المشكلة: `npm ERR! 404 Not Found`
**الحل**: ستُختار npm بدل pnpm - وهذا صحيح ✓

### المشكلة: `PORT not specified`
**الحل**: يتم تعيين PORT تلقائياً من Vercel

### المشكلة: `DATABASE_URL not found`
**الحل**: 
1. اذهب إلى Vercel Settings
2. أضف `DATABASE_URL` في Environment Variables
3. أعد Deploy

### المشكلة: `Build failed`
**الحل**:
```bash
# تحقق محلياً
npm install
npm run build

# تحقق من الأخطاء في السجل
```

---

## 📊 تحقق من النشر

بعد النشر الناجح:

1. ستحصل على رابط مثل: `https://bua-asset-management.vercel.app`
2. اختبر التطبيق في المتصفح
3. تحقق من وحدة تحكم Vercel للأخطاء

---

## 🔐 الأمان

### متغيرات البيئة الحساسة
- ✅ DATABASE_URL محمي
- ✅ لا تُرسل .env للـ GitHub
- ✅ الـ .gitignore يحمي البيانات الحساسة

### قبل الإطلاق للإنتاج
1. غيّر جميع كلمات المرور الافتراضية
2. فعّل HTTPS (Vercel يفعله تلقائياً)
3. أضف نطاق مخصص (اختياري)

---

## 📱 التحديثات المستقبلية

```bash
# لكل تحديث جديد:
git add .
git commit -m "Update: [description]"
git push origin main

# Vercel سيكتشف التحديث تلقائياً
# ويُعيد النشر فوراً
```

---

## 📞 الدعم

إذا واجهت مشاكل:

1. تحقق من السجل في Vercel Dashboard
2. اقرأ رسائل الأخطاء بعناية
3. جرّب البناء محلياً أولاً: `npm run build`

---

**الحالة**: ✅ جاهز للنشر
**آخر تحديث**: 31 يناير 2026

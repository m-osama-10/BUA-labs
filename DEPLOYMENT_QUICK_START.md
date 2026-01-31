# ✅ Deployment Checklist & Quick Start

## 🔧 قبل النشر - Before Deployment

### الخطوة 1: تنظيف المشروع
```bash
# احذف pnpm-lock.yaml (سيتم إنشاء package-lock.json على Vercel)
rm pnpm-lock.yaml

# تأكد من وجود package-lock.json
ls package-lock.json
```

### الخطوة 2: اختبر البناء محلياً
```bash
npm install
npm run build
npm start
```

### الخطوة 3: تجهيز البيانات الحساسة
```bash
# تأكد من .env لا يوجد في Git
grep -v ".env" .gitignore

# تحقق من .gitignore
cat .gitignore | grep "\.env"
```

---

## 🚀 نشر على GitHub

```bash
# 1. تهيئة Git
git init
git add .
git commit -m "Initial commit: BUA Asset Management System"

# 2. إضافة Remote
git remote add origin https://github.com/YOUR_USERNAME/bua-asset-management.git

# 3. الدفع إلى main branch
git branch -M main
git push -u origin main
```

---

## 🌐 نشر على Vercel

### الطريقة 1: عبر الواجهة الرسومية (سهل)

1. اذهب إلى https://vercel.com/new
2. اضغط "Import Git Repository"
3. اختر المشروع من GitHub
4. Vercel سيكتشف الإعدادات تلقائياً
5. أضف متغيرات البيئة في "Environment Variables"

### الطريقة 2: عبر CLI

```bash
# 1. تثبيت Vercel CLI
npm i -g vercel

# 2. الدخول
vercel login

# 3. النشر
vercel

# 4. يتم السؤال عن الإعدادات - اقبل التلقائية
# Press Y لـ "Set up and deploy" بشكل سريع
```

---

## 🔐 متغيرات البيئة المطلوبة

في Vercel Dashboard → Settings → Environment Variables

```
DATABASE_URL=mysql://user:password@host:3306/database
NODE_ENV=production
```

**حيث:**
- `user`: اسم المستخدم في قاعدة البيانات
- `password`: كلمة المرور
- `host`: عنوان الخادم (مثل: db.example.com أو IP)
- `database`: اسم قاعدة البيانات

---

## ✅ الملفات المُضافة للتوافق مع Vercel

| الملف | الدور |
|------|-------|
| `vercel.json` | إعدادات البناء والنشر |
| `.npmrc` | إعدادات npm للتوافق |
| `DEPLOYMENT_GUIDE_AR.md` | دليل النشر الكامل |

---

## 🧪 اختبر بعد النشر

```bash
# 1. اذهب إلى رابط التطبيق
https://your-app.vercel.app

# 2. جرّب المميزات الأساسية
# - تسجيل الدخول
# - إضافة جهاز
# - إضافة مستخدم

# 3. تحقق من Console لأي أخطاء
# (اضغط F12 > Console)

# 4. تحقق من وحدة تحكم Vercel
# https://vercel.com/dashboard
```

---

## 🐛 حل المشاكل الشائعة

### ❌ "Build failed"
```bash
# حل:
npm install  # تأكد من التثبيت
npm run build  # جرّب البناء محلياً
```

### ❌ "DATABASE_URL not found"
```
حل: أضف DATABASE_URL في Vercel Settings
```

### ❌ "Port not specified"
```
حل: Vercel يعيّن PORT تلقائياً - بدون مشكلة
```

### ❌ "npm ERR! 404"
```
حل: هذا طبيعي - npm بدل pnpm
```

---

## 📊 الحالة النهائية

بعد النشر الناجح ستحصل على:

✅ رابط مباشر للتطبيق
✅ HTTPS تلقائي (آمن)
✅ CI/CD مدمج (تحديثات تلقائية)
✅ Analytics من Vercel
✅ Custom domain (اختياري)

---

## 🔄 التحديثات المستقبلية

```bash
# فقط اضغط وادفع:
git add .
git commit -m "Update: [description]"
git push origin main

# Vercel سيكتشف تلقائياً ويُعيد النشر! ✨
```

---

**آخر تحديث**: 31 يناير 2026
**الحالة**: ✅ جاهز للنشر الفوري

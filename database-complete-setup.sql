-- ============================================================
-- BUA Asset Management - Complete Database Setup
-- ============================================================

-- Step 1: Create database
CREATE DATABASE IF NOT EXISTS bua_assets CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Step 2: Use the database
USE bua_assets;

-- Step 3: Create faculties table
CREATE TABLE IF NOT EXISTS faculties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 4: Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  facultyId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (facultyId) REFERENCES faculties(id) ON DELETE CASCADE,
  INDEX idx_facultyId (facultyId),
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 5: Create laboratories table
CREATE TABLE IF NOT EXISTS laboratories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  departmentId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  location VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (departmentId) REFERENCES departments(id) ON DELETE CASCADE,
  INDEX idx_departmentId (departmentId),
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INSERT 8 FACULTIES
-- ============================================================

INSERT IGNORE INTO faculties (id, name, code, createdAt, updatedAt) VALUES
(1, 'كلية الصيدلة', 'PHARM', NOW(), NOW()),
(2, 'كلية طب الفم والأسنان', 'DENT', NOW(), NOW()),
(3, 'كلية الطب البيطري', 'VET', NOW(), NOW()),
(4, 'كلية العلاج الطبيعي', 'PT', NOW(), NOW()),
(5, 'كلية التمريض', 'NURS', NOW(), NOW()),
(6, 'كلية البيوتكنولوجيا', 'BIO', NOW(), NOW()),
(7, 'كلية الطب البشري', 'MED', NOW(), NOW()),
(8, 'كلية العلوم الصحية', 'HS', NOW(), NOW());

-- ============================================================
-- INSERT 20 DEPARTMENTS
-- ============================================================

INSERT IGNORE INTO departments (id, facultyId, name, code, createdAt, updatedAt) VALUES
(1, 1, 'قسم الصيدلة الإكلينيكية', 'PHARM-CL', NOW(), NOW()),
(2, 1, 'قسم الصيدلة الصناعية', 'PHARM-IND', NOW(), NOW()),
(3, 1, 'قسم الكيمياء الدوائية', 'PHARM-CHEM', NOW(), NOW()),
(4, 2, 'قسم طب الأسنان العام', 'DENT-GEN', NOW(), NOW()),
(5, 2, 'قسم طب الأسنان التحفظي', 'DENT-CONS', NOW(), NOW()),
(6, 2, 'قسم جراحة الفم والفكين', 'DENT-SURG', NOW(), NOW()),
(7, 3, 'قسم الطب الباطني البيطري', 'VET-INT', NOW(), NOW()),
(8, 3, 'قسم الجراحة البيطرية', 'VET-SURG', NOW(), NOW()),
(9, 3, 'قسم الإنتاج الحيواني', 'VET-PROD', NOW(), NOW()),
(10, 4, 'قسم العلاج الطبيعي العام', 'PT-GEN', NOW(), NOW()),
(11, 4, 'قسم إعادة التأهيل', 'PT-REHAB', NOW(), NOW()),
(12, 5, 'قسم التمريض السريري', 'NURS-CL', NOW(), NOW()),
(13, 5, 'قسم تمريض المجتمع', 'NURS-COM', NOW(), NOW()),
(14, 6, 'قسم الهندسة الوراثية', 'BIO-GEN', NOW(), NOW()),
(15, 6, 'قسم البيولوجيا الجزيئية', 'BIO-MOL', NOW(), NOW()),
(16, 7, 'قسم الطب الباطني', 'MED-INT', NOW(), NOW()),
(17, 7, 'قسم الجراحة العامة', 'MED-SURG', NOW(), NOW()),
(18, 7, 'قسم طب الأطفال', 'MED-PED', NOW(), NOW()),
(19, 8, 'قسم الصحة العامة', 'HS-PH', NOW(), NOW()),
(20, 8, 'قسم علوم التغذية', 'HS-NUTR', NOW(), NOW());

-- ============================================================
-- INSERT 21 LABORATORIES
-- ============================================================

INSERT IGNORE INTO laboratories (id, departmentId, name, code, location, createdAt, updatedAt) VALUES
(1, 1, 'مختبر الصيدلة الإكلينيكية 1', 'PHARM-CL-LAB1', 'المبنى A - الطابق 2', NOW(), NOW()),
(2, 1, 'مختبر الصيدلة الإكلينيكية 2', 'PHARM-CL-LAB2', 'المبنى A - الطابق 3', NOW(), NOW()),
(3, 2, 'مختبر الصيدلة الصناعية', 'PHARM-IND-LAB', 'المبنى B - الطابق 1', NOW(), NOW()),
(4, 3, 'مختبر الكيمياء الدوائية', 'PHARM-CHEM-LAB', 'المبنى C - الطابق 2', NOW(), NOW()),
(5, 4, 'عيادة طب الأسنان العام 1', 'DENT-GEN-CL1', 'المبنى D - الطابق 1', NOW(), NOW()),
(6, 4, 'عيادة طب الأسنان العام 2', 'DENT-GEN-CL2', 'المبنى D - الطابق 2', NOW(), NOW()),
(7, 5, 'عيادة التحفظي', 'DENT-CONS-CL', 'المبنى D - الطابق 3', NOW(), NOW()),
(8, 6, 'غرفة جراحة الفم', 'DENT-SURG-OR', 'المبنى D - الطابق 4', NOW(), NOW()),
(9, 7, 'عيادة الطب الباطني', 'VET-INT-CL', 'المبنى E - الطابق 1', NOW(), NOW()),
(10, 8, 'غرفة الجراحة البيطرية', 'VET-SURG-OR', 'المبنى E - الطابق 2', NOW(), NOW()),
(11, 9, 'مختبر الإنتاج الحيواني', 'VET-PROD-LAB', 'المبنى E - الطابق 3', NOW(), NOW()),
(12, 10, 'قاعة العلاج الطبيعي', 'PT-GEN-HALL', 'المبنى F - الطابق 1', NOW(), NOW()),
(13, 11, 'مركز إعادة التأهيل', 'PT-REHAB-CTR', 'المبنى F - الطابق 2', NOW(), NOW()),
(14, 12, 'قاعة التمريض السريري', 'NURS-CL-HALL', 'المبنى G - الطابق 1', NOW(), NOW()),
(15, 13, 'مختبر تمريض المجتمع', 'NURS-COM-LAB', 'المبنى G - الطابق 2', NOW(), NOW()),
(16, 14, 'مختبر الهندسة الوراثية', 'BIO-GEN-LAB', 'المبنى H - الطابق 1', NOW(), NOW()),
(17, 15, 'مختبر البيولوجيا الجزيئية', 'BIO-MOL-LAB', 'المبنى H - الطابق 2', NOW(), NOW()),
(18, 16, 'عيادة الطب الباطني', 'MED-INT-CL', 'المبنى I - الطابق 1', NOW(), NOW()),
(19, 17, 'غرفة الجراحة العامة', 'MED-SURG-OR', 'المبنى I - الطابق 2', NOW(), NOW()),
(20, 18, 'عيادة طب الأطفال', 'MED-PED-CL', 'المبنى I - الطابق 3', NOW(), NOW()),
(21, 19, 'مختبر الصحة العامة', 'HS-PH-LAB', 'المبنى J - الطابق 1', NOW(), NOW()),
(22, 20, 'مختبر علوم التغذية', 'HS-NUTR-LAB', 'المبنى J - الطابق 2', NOW(), NOW()),
(23, 20, 'مختبر المختبرات الطبية', 'HS-LAB-LAB', 'المبنى J - الطابق 3', NOW(), NOW());

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT '✅ الكليات' as النوع, COUNT(*) as العدد FROM faculties
UNION ALL
SELECT '✅ الأقسام', COUNT(*) FROM departments
UNION ALL
SELECT '✅ المختبرات', COUNT(*) FROM laboratories;

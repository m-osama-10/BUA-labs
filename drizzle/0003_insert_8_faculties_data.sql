-- Create database
CREATE DATABASE IF NOT EXISTS bua_assets CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use database
USE bua_assets;

-- Insert 8 faculties
INSERT INTO `faculties` (`name`, `code`, `createdAt`, `updatedAt`) VALUES
('كلية الصيدلة', 'PHARM', NOW(), NOW()),
('كلية طب الفم والأسنان', 'DENT', NOW(), NOW()),
('كلية الطب البيطري', 'VET', NOW(), NOW()),
('كلية العلاج الطبيعي', 'PT', NOW(), NOW()),
('كلية التمريض', 'NURS', NOW(), NOW()),
('كلية البيوتكنولوجيا', 'BIO', NOW(), NOW()),
('كلية الطب البشري', 'MED', NOW(), NOW()),
('كلية العلوم الصحية', 'HS', NOW(), NOW());

-- Insert departments for PHARM (1)
INSERT INTO `departments` (`facultyId`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(1, 'قسم الصيدلة الإكلينيكية', 'PHARM-CL', NOW(), NOW()),
(1, 'قسم الصيدلة الصناعية', 'PHARM-IND', NOW(), NOW()),
(1, 'قسم الكيمياء الدوائية', 'PHARM-CHEM', NOW(), NOW());

-- Insert departments for DENT (2)
INSERT INTO `departments` (`facultyId`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(2, 'قسم طب الأسنان العام', 'DENT-GEN', NOW(), NOW()),
(2, 'قسم طب الأسنان التحفظي', 'DENT-CONS', NOW(), NOW()),
(2, 'قسم جراحة الفم والفكين', 'DENT-SURG', NOW(), NOW());

-- Insert departments for VET (3)
INSERT INTO `departments` (`facultyId`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(3, 'قسم الطب الباطني البيطري', 'VET-INT', NOW(), NOW()),
(3, 'قسم الجراحة البيطرية', 'VET-SURG', NOW(), NOW()),
(3, 'قسم الإنتاج الحيواني', 'VET-PROD', NOW(), NOW());

-- Insert departments for PT (4)
INSERT INTO `departments` (`facultyId`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(4, 'قسم العلاج الطبيعي العام', 'PT-GEN', NOW(), NOW()),
(4, 'قسم إعادة التأهيل', 'PT-REHAB', NOW(), NOW());

-- Insert departments for NURS (5)
INSERT INTO `departments` (`facultyId`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(5, 'قسم التمريض السريري', 'NURS-CL', NOW(), NOW()),
(5, 'قسم تمريض المجتمع', 'NURS-COM', NOW(), NOW());

-- Insert departments for BIO (6)
INSERT INTO `departments` (`facultyId`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(6, 'قسم الهندسة الوراثية', 'BIO-GEN', NOW(), NOW()),
(6, 'قسم البيولوجيا الجزيئية', 'BIO-MOL', NOW(), NOW());

-- Insert departments for MED (7)
INSERT INTO `departments` (`facultyId`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(7, 'قسم الطب الباطني', 'MED-INT', NOW(), NOW()),
(7, 'قسم الجراحة العامة', 'MED-SURG', NOW(), NOW()),
(7, 'قسم طب الأطفال', 'MED-PED', NOW(), NOW());

-- Insert departments for HS (8)
INSERT INTO `departments` (`facultyId`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(8, 'قسم الصحة العامة', 'HS-PH', NOW(), NOW()),
(8, 'قسم علوم التغذية', 'HS-NUTR', NOW(), NOW()),
(8, 'قسم المختبرات الطبية', 'HS-LAB', NOW(), NOW());

-- Insert laboratories for PHARM
INSERT INTO `laboratories` (`departmentId`, `name`, `code`, `location`, `createdAt`, `updatedAt`) VALUES
(1, 'مختبر الصيدلة الإكلينيكية 1', 'PHARM-CL-LAB1', 'المبنى A - الطابق 2', NOW(), NOW()),
(1, 'مختبر الصيدلة الإكلينيكية 2', 'PHARM-CL-LAB2', 'المبنى A - الطابق 3', NOW(), NOW()),
(2, 'مختبر الصيدلة الصناعية', 'PHARM-IND-LAB', 'المبنى B - الطابق 1', NOW(), NOW()),
(3, 'مختبر الكيمياء الدوائية', 'PHARM-CHEM-LAB', 'المبنى C - الطابق 2', NOW(), NOW());

-- Insert laboratories for DENT
INSERT INTO `laboratories` (`departmentId`, `name`, `code`, `location`, `createdAt`, `updatedAt`) VALUES
(4, 'عيادة طب الأسنان العام 1', 'DENT-GEN-CL1', 'المبنى D - الطابق 1', NOW(), NOW()),
(4, 'عيادة طب الأسنان العام 2', 'DENT-GEN-CL2', 'المبنى D - الطابق 2', NOW(), NOW()),
(5, 'عيادة التحفظي', 'DENT-CONS-CL', 'المبنى D - الطابق 3', NOW(), NOW()),
(6, 'غرفة جراحة الفم', 'DENT-SURG-OR', 'المبنى D - الطابق 4', NOW(), NOW());

-- Insert laboratories for VET
INSERT INTO `laboratories` (`departmentId`, `name`, `code`, `location`, `createdAt`, `updatedAt`) VALUES
(7, 'عيادة الطب الباطني', 'VET-INT-CL', 'المبنى E - الطابق 1', NOW(), NOW()),
(8, 'غرفة الجراحة البيطرية', 'VET-SURG-OR', 'المبنى E - الطابق 2', NOW(), NOW()),
(9, 'مختبر الإنتاج الحيواني', 'VET-PROD-LAB', 'المبنى E - الطابق 3', NOW(), NOW());

-- Insert laboratories for PT
INSERT INTO `laboratories` (`departmentId`, `name`, `code`, `location`, `createdAt`, `updatedAt`) VALUES
(10, 'قاعة العلاج الطبيعي', 'PT-GEN-HALL', 'المبنى F - الطابق 1', NOW(), NOW()),
(11, 'مركز إعادة التأهيل', 'PT-REHAB-CTR', 'المبنى F - الطابق 2', NOW(), NOW());

-- Insert laboratories for NURS
INSERT INTO `laboratories` (`departmentId`, `name`, `code`, `location`, `createdAt`, `updatedAt`) VALUES
(12, 'قاعة التمريض السريري', 'NURS-CL-HALL', 'المبنى G - الطابق 1', NOW(), NOW()),
(13, 'مختبر تمريض المجتمع', 'NURS-COM-LAB', 'المبنى G - الطابق 2', NOW(), NOW());

-- Insert laboratories for BIO
INSERT INTO `laboratories` (`departmentId`, `name`, `code`, `location`, `createdAt`, `updatedAt`) VALUES
(14, 'مختبر الهندسة الوراثية', 'BIO-GEN-LAB', 'المبنى H - الطابق 1', NOW(), NOW()),
(15, 'مختبر البيولوجيا الجزيئية', 'BIO-MOL-LAB', 'المبنى H - الطابق 2', NOW(), NOW());

-- Insert laboratories for MED
INSERT INTO `laboratories` (`departmentId`, `name`, `code`, `location`, `createdAt`, `updatedAt`) VALUES
(16, 'عيادة الطب الباطني', 'MED-INT-CL', 'المبنى I - الطابق 1', NOW(), NOW()),
(17, 'غرفة الجراحة العامة', 'MED-SURG-OR', 'المبنى I - الطابق 2', NOW(), NOW()),
(18, 'عيادة طب الأطفال', 'MED-PED-CL', 'المبنى I - الطابق 3', NOW(), NOW());

-- Insert laboratories for HS
INSERT INTO `laboratories` (`departmentId`, `name`, `code`, `location`, `createdAt`, `updatedAt`) VALUES
(19, 'مختبر الصحة العامة', 'HS-PH-LAB', 'المبنى J - الطابق 1', NOW(), NOW()),
(20, 'مختبر علوم التغذية', 'HS-NUTR-LAB', 'المبنى J - الطابق 2', NOW(), NOW()),
(21, 'مختبر المختبرات الطبية', 'HS-LAB-LAB', 'المبنى J - الطابق 3', NOW(), NOW());

-- Verify data
SELECT COUNT(*) as total_faculties FROM faculties;
SELECT COUNT(*) as total_departments FROM departments;
SELECT COUNT(*) as total_laboratories FROM laboratories;

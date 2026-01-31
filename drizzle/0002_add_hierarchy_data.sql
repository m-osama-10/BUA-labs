-- Insert 12 faculties into the system
INSERT INTO `faculties` (`name`, `code`, `createdAt`, `updatedAt`) VALUES
('كلية الصيدلة', 'PHARM', NOW(), NOW()),
('كلية طب الفم والأسنان', 'DENT', NOW(), NOW()),
('كلية الطب البيطري', 'VET', NOW(), NOW()),
('كلية التمريض', 'NURS', NOW(), NOW()),
('كلية العلاج الطبيعي', 'PT', NOW(), NOW()),
('كلية العلوم الصحية', 'HS', NOW(), NOW()),
('كلية البيوتكنولوجيا', 'BIO', NOW(), NOW()),
('كلية الطب البشري', 'MED', NOW(), NOW()),
('كلية الهندسة', 'ENG', NOW(), NOW()),
('كلية العلوم', 'SCI', NOW(), NOW()),
('كلية الآداب', 'ART', NOW(), NOW()),
('كلية التربية', 'EDU', NOW(), NOW());

-- Insert departments for each faculty
-- كلية الصيدلة (PHARM)
INSERT INTO `departments` (`facultyId`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(1, 'قسم الصيدلة الإكلينيكية', 'PHARM-CL', NOW(), NOW()),
(1, 'قسم الصيدلة الصناعية', 'PHARM-IND', NOW(), NOW()),
(1, 'قسم الكيمياء الدوائية', 'PHARM-CHEM', NOW(), NOW());

-- كلية طب الفم والأسنان (DENT)
INSERT INTO `departments` (`facultyId`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(2, 'قسم طب الأسنان العام', 'DENT-GEN', NOW(), NOW()),
(2, 'قسم طب الأسنان التحفظي', 'DENT-CONS', NOW(), NOW()),
(2, 'قسم جراحة الفم والفكين', 'DENT-SURG', NOW(), NOW());

-- كلية الطب البيطري (VET)
INSERT INTO `departments` (`facultyId`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(3, 'قسم الطب الباطني البيطري', 'VET-INT', NOW(), NOW()),
(3, 'قسم الجراحة البيطرية', 'VET-SURG', NOW(), NOW()),
(3, 'قسم الإنتاج الحيواني', 'VET-PROD', NOW(), NOW());

-- كلية التمريض (NURS)
INSERT INTO `departments` (`facultyId`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(4, 'قسم التمريض السريري', 'NURS-CL', NOW(), NOW()),
(4, 'قسم تمريض المجتمع', 'NURS-COM', NOW(), NOW());

-- كلية العلاج الطبيعي (PT)
INSERT INTO `departments` (`facultyId`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(5, 'قسم العلاج الطبيعي العام', 'PT-GEN', NOW(), NOW()),
(5, 'قسم إعادة التأهيل', 'PT-REHAB', NOW(), NOW());

-- كلية العلوم الصحية (HS)
INSERT INTO `departments` (`facultyId`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(6, 'قسم الصحة العامة', 'HS-PH', NOW(), NOW()),
(6, 'قسم علوم التغذية', 'HS-NUTR', NOW(), NOW()),
(6, 'قسم المختبرات الطبية', 'HS-LAB', NOW(), NOW());

-- كلية البيوتكنولوجيا (BIO)
INSERT INTO `departments` (`facultyId`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(7, 'قسم الهندسة الوراثية', 'BIO-GEN', NOW(), NOW()),
(7, 'قسم البيولوجيا الجزيئية', 'BIO-MOL', NOW(), NOW());

-- كلية الطب البشري (MED)
INSERT INTO `departments` (`facultyId`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(8, 'قسم الطب الباطني', 'MED-INT', NOW(), NOW()),
(8, 'قسم الجراحة العامة', 'MED-SURG', NOW(), NOW()),
(8, 'قسم طب الأطفال', 'MED-PED', NOW(), NOW());

-- كلية الهندسة (ENG)
INSERT INTO `departments` (`facultyId`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(9, 'قسم الهندسة المدنية', 'ENG-CIVIL', NOW(), NOW()),
(9, 'قسم الهندسة الكهربائية', 'ENG-ELEC', NOW(), NOW()),
(9, 'قسم الهندسة الميكانيكية', 'ENG-MECH', NOW(), NOW());

-- كلية العلوم (SCI)
INSERT INTO `departments` (`facultyId`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(10, 'قسم الكيمياء', 'SCI-CHEM', NOW(), NOW()),
(10, 'قسم الفيزياء', 'SCI-PHYS', NOW(), NOW()),
(10, 'قسم الأحياء', 'SCI-BIO', NOW(), NOW());

-- كلية الآداب (ART)
INSERT INTO `departments` (`facultyId`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(11, 'قسم اللغة العربية', 'ART-AR', NOW(), NOW()),
(11, 'قسم اللغات الأجنبية', 'ART-FOR', NOW(), NOW());

-- كلية التربية (EDU)
INSERT INTO `departments` (`facultyId`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(12, 'قسم التربية الأساسية', 'EDU-ELEM', NOW(), NOW()),
(12, 'قسم التربية الثانوية', 'EDU-SEC', NOW(), NOW());

-- Insert laboratories for each department
-- PHARM departments
INSERT INTO `laboratories` (`departmentId`, `name`, `code`, `location`, `createdAt`, `updatedAt`) VALUES
(1, 'مختبر الصيدلة الإكلينيكية 1', 'PHARM-CL-LAB1', 'المبنى A - الطابق 2', NOW(), NOW()),
(1, 'مختبر الصيدلة الإكلينيكية 2', 'PHARM-CL-LAB2', 'المبنى A - الطابق 3', NOW(), NOW()),
(2, 'مختبر الصيدلة الصناعية', 'PHARM-IND-LAB', 'المبنى B - الطابق 1', NOW(), NOW()),
(3, 'مختبر الكيمياء الدوائية', 'PHARM-CHEM-LAB', 'المبنى C - الطابق 2', NOW(), NOW());

-- DENT departments
INSERT INTO `laboratories` (`departmentId`, `name`, `code`, `location`, `createdAt`, `updatedAt`) VALUES
(4, 'عيادة طب الأسنان العام 1', 'DENT-GEN-CL1', 'المبنى D - الطابق 1', NOW(), NOW()),
(4, 'عيادة طب الأسنان العام 2', 'DENT-GEN-CL2', 'المبنى D - الطابق 2', NOW(), NOW()),
(5, 'عيادة التحفظي', 'DENT-CONS-CL', 'المبنى D - الطابق 3', NOW(), NOW()),
(6, 'غرفة جراحة الفم', 'DENT-SURG-OR', 'المبنى D - الطابق 4', NOW(), NOW());

-- VET departments
INSERT INTO `laboratories` (`departmentId`, `name`, `code`, `location`, `createdAt`, `updatedAt`) VALUES
(7, 'عيادة الطب الباطني', 'VET-INT-CL', 'المبنى E - الطابق 1', NOW(), NOW()),
(8, 'غرفة الجراحة البيطرية', 'VET-SURG-OR', 'المبنى E - الطابق 2', NOW(), NOW()),
(9, 'مختبر الإنتاج الحيواني', 'VET-PROD-LAB', 'المبنى E - الطابق 3', NOW(), NOW());

-- NURS departments
INSERT INTO `laboratories` (`departmentId`, `name`, `code`, `location`, `createdAt`, `updatedAt`) VALUES
(10, 'قاعة التمريض السريري', 'NURS-CL-HALL', 'المبنى F - الطابق 1', NOW(), NOW()),
(11, 'مختبر تمريض المجتمع', 'NURS-COM-LAB', 'المبنى F - الطابق 2', NOW(), NOW());

-- PT departments
INSERT INTO `laboratories` (`departmentId`, `name`, `code`, `location`, `createdAt`, `updatedAt`) VALUES
(12, 'قاعة العلاج الطبيعي', 'PT-GEN-HALL', 'المبنى G - الطابق 1', NOW(), NOW()),
(13, 'مركز إعادة التأهيل', 'PT-REHAB-CTR', 'المبنى G - الطابق 2', NOW(), NOW());

-- HS departments
INSERT INTO `laboratories` (`departmentId`, `name`, `code`, `location`, `createdAt`, `updatedAt`) VALUES
(14, 'مختبر الصحة العامة', 'HS-PH-LAB', 'المبنى H - الطابق 1', NOW(), NOW()),
(15, 'مختبر علوم التغذية', 'HS-NUTR-LAB', 'المبنى H - الطابق 2', NOW(), NOW()),
(16, 'مختبر المختبرات الطبية', 'HS-LAB-LAB', 'المبنى H - الطابق 3', NOW(), NOW());

-- BIO departments
INSERT INTO `laboratories` (`departmentId`, `name`, `code`, `location`, `createdAt`, `updatedAt`) VALUES
(17, 'مختبر الهندسة الوراثية', 'BIO-GEN-LAB', 'المبنى I - الطابق 1', NOW(), NOW()),
(18, 'مختبر البيولوجيا الجزيئية', 'BIO-MOL-LAB', 'المبنى I - الطابق 2', NOW(), NOW());

-- MED departments
INSERT INTO `laboratories` (`departmentId`, `name`, `code`, `location`, `createdAt`, `updatedAt`) VALUES
(19, 'عيادة الطب الباطني', 'MED-INT-CL', 'المبنى J - الطابق 1', NOW(), NOW()),
(20, 'غرفة الجراحة العامة', 'MED-SURG-OR', 'المبنى J - الطابق 2', NOW(), NOW()),
(21, 'عيادة طب الأطفال', 'MED-PED-CL', 'المبنى J - الطابق 3', NOW(), NOW());

-- ENG departments
INSERT INTO `laboratories` (`departmentId`, `name`, `code`, `location`, `createdAt`, `updatedAt`) VALUES
(22, 'مختبر الهندسة المدنية', 'ENG-CIVIL-LAB', 'المبنى K - الطابق 1', NOW(), NOW()),
(23, 'مختبر الهندسة الكهربائية', 'ENG-ELEC-LAB', 'المبنى K - الطابق 2', NOW(), NOW()),
(24, 'مختبر الهندسة الميكانيكية', 'ENG-MECH-LAB', 'المبنى K - الطابق 3', NOW(), NOW());

-- SCI departments
INSERT INTO `laboratories` (`departmentId`, `name`, `code`, `location`, `createdAt`, `updatedAt`) VALUES
(25, 'مختبر الكيمياء', 'SCI-CHEM-LAB', 'المبنى L - الطابق 1', NOW(), NOW()),
(26, 'مختبر الفيزياء', 'SCI-PHYS-LAB', 'المبنى L - الطابق 2', NOW(), NOW()),
(27, 'مختبر الأحياء', 'SCI-BIO-LAB', 'المبنى L - الطابق 3', NOW(), NOW());

-- ART departments
INSERT INTO `laboratories` (`departmentId`, `name`, `code`, `location`, `createdAt`, `updatedAt`) VALUES
(28, 'مختبر اللغة العربية', 'ART-AR-LAB', 'المبنى M - الطابق 1', NOW(), NOW()),
(29, 'مختبر اللغات الأجنبية', 'ART-FOR-LAB', 'المبنى M - الطابق 2', NOW(), NOW());

-- EDU departments
INSERT INTO `laboratories` (`departmentId`, `name`, `code`, `location`, `createdAt`, `updatedAt`) VALUES
(30, 'قاعة التربية الأساسية', 'EDU-ELEM-HALL', 'المبنى N - الطابق 1', NOW(), NOW()),
(31, 'قاعة التربية الثانوية', 'EDU-SEC-HALL', 'المبنى N - الطابق 2', NOW(), NOW());

-- ============================================================
-- BUA Asset Management - Complete Database with All Tables
-- ============================================================

USE bua_assets;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin', 'unit_manager', 'technician') DEFAULT 'user' NOT NULL,
  facultyId INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX openId_idx (openId),
  INDEX role_idx (role),
  UNIQUE KEY openId_unique (openId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DEVICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deviceId VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  currentLaboratoryId INT NOT NULL,
  currentDepartmentId INT NOT NULL,
  currentFacultyId INT NOT NULL,
  purchaseDate DATE NOT NULL,
  purchasePrice DECIMAL(12, 2) NOT NULL,
  expectedLifetimeYears INT NOT NULL,
  currentStatus ENUM('working', 'under_maintenance', 'out_of_service') DEFAULT 'working' NOT NULL,
  notes TEXT,
  qrCodeToken VARCHAR(100) NOT NULL UNIQUE,
  createdBy INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY device_deviceId_idx (deviceId),
  UNIQUE KEY device_qrCodeToken_idx (qrCodeToken),
  INDEX device_currentLaboratoryId_idx (currentLaboratoryId),
  INDEX device_currentStatus_idx (currentStatus),
  INDEX device_currentFacultyId_idx (currentFacultyId),
  FOREIGN KEY (currentLaboratoryId) REFERENCES laboratories(id) ON DELETE RESTRICT,
  FOREIGN KEY (currentDepartmentId) REFERENCES departments(id) ON DELETE RESTRICT,
  FOREIGN KEY (currentFacultyId) REFERENCES faculties(id) ON DELETE RESTRICT,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TRANSFERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS transfers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deviceId INT NOT NULL,
  fromLaboratoryId INT NOT NULL,
  toLaboratoryId INT NOT NULL,
  fromFacultyId INT NOT NULL,
  toFacultyId INT NOT NULL,
  transferDate DATETIME NOT NULL,
  reason TEXT,
  approvedBy INT,
  approvalDate DATETIME,
  notes TEXT,
  createdBy INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX transfer_deviceId_idx (deviceId),
  INDEX transfer_transferDate_idx (transferDate),
  FOREIGN KEY (deviceId) REFERENCES devices(id) ON DELETE CASCADE,
  FOREIGN KEY (fromLaboratoryId) REFERENCES laboratories(id) ON DELETE RESTRICT,
  FOREIGN KEY (toLaboratoryId) REFERENCES laboratories(id) ON DELETE RESTRICT,
  FOREIGN KEY (fromFacultyId) REFERENCES faculties(id) ON DELETE RESTRICT,
  FOREIGN KEY (toFacultyId) REFERENCES faculties(id) ON DELETE RESTRICT,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- MAINTENANCE REQUESTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deviceId INT NOT NULL,
  maintenanceType ENUM('periodic', 'emergency') NOT NULL,
  status ENUM('requested', 'approved', 'in_progress', 'completed', 'cancelled') DEFAULT 'requested' NOT NULL,
  requestedBy INT NOT NULL,
  assignedTo INT,
  scheduledDate DATETIME,
  completedDate DATETIME,
  cost DECIMAL(12, 2),
  notes TEXT,
  createdBy INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX maintenance_request_deviceId_idx (deviceId),
  INDEX maintenance_request_status_idx (status),
  INDEX maintenance_request_assignedTo_idx (assignedTo),
  FOREIGN KEY (deviceId) REFERENCES devices(id) ON DELETE CASCADE,
  FOREIGN KEY (requestedBy) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- MAINTENANCE RECORDS TABLE (for historical tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS maintenance_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deviceId INT NOT NULL,
  maintenanceType ENUM('periodic', 'emergency') NOT NULL,
  completedDate DATETIME NOT NULL,
  performedBy INT NOT NULL,
  cost DECIMAL(12, 2),
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX maintenance_record_deviceId_idx (deviceId),
  FOREIGN KEY (deviceId) REFERENCES devices(id) ON DELETE CASCADE,
  FOREIGN KEY (performedBy) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DEPRECIATION RECORDS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS depreciation_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deviceId INT NOT NULL,
  purchasePrice DECIMAL(12, 2) NOT NULL,
  expectedLifetimeYears INT NOT NULL,
  depreciationYear INT NOT NULL,
  depreciationAmount DECIMAL(12, 2) NOT NULL,
  bookValue DECIMAL(12, 2) NOT NULL,
  calculatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX depreciation_record_deviceId_idx (deviceId),
  FOREIGN KEY (deviceId) REFERENCES devices(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- AUDIT LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  action VARCHAR(255) NOT NULL,
  entityType VARCHAR(100) NOT NULL,
  entityId INT,
  changes JSON,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX audit_log_userId_idx (userId),
  INDEX audit_log_entityType_idx (entityType),
  INDEX audit_log_createdAt_idx (createdAt),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- NOTIFICATION PREFERENCES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  notificationType VARCHAR(100) NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY user_notification_type (userId, notificationType),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Verify all tables created
-- ============================================================
SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'bua_assets' ORDER BY TABLE_NAME;

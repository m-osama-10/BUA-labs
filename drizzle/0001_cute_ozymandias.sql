CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int NOT NULL,
	`action` varchar(50) NOT NULL,
	`userId` int NOT NULL,
	`oldValues` json,
	`newValues` json,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`facultyId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `departments_id` PRIMARY KEY(`id`),
	CONSTRAINT `departments_code_unique` UNIQUE(`code`),
	CONSTRAINT `department_code_idx` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `depreciation_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` int NOT NULL,
	`originalPrice` decimal(12,2) NOT NULL,
	`expectedLifetimeYears` int NOT NULL,
	`annualDepreciation` decimal(12,2) NOT NULL,
	`calculationDate` date NOT NULL,
	`currentBookValue` decimal(12,2) NOT NULL,
	`depreciationPercentage` decimal(5,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `depreciation_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`currentLaboratoryId` int NOT NULL,
	`currentDepartmentId` int NOT NULL,
	`currentFacultyId` int NOT NULL,
	`purchaseDate` date NOT NULL,
	`purchasePrice` decimal(12,2) NOT NULL,
	`expectedLifetimeYears` int NOT NULL,
	`currentStatus` enum('working','under_maintenance','out_of_service') NOT NULL DEFAULT 'working',
	`notes` text,
	`qrCodeToken` varchar(100) NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `devices_id` PRIMARY KEY(`id`),
	CONSTRAINT `devices_deviceId_unique` UNIQUE(`deviceId`),
	CONSTRAINT `devices_qrCodeToken_unique` UNIQUE(`qrCodeToken`),
	CONSTRAINT `device_deviceId_idx` UNIQUE(`deviceId`),
	CONSTRAINT `device_qrCodeToken_idx` UNIQUE(`qrCodeToken`)
);
--> statement-breakpoint
CREATE TABLE `faculties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faculties_id` PRIMARY KEY(`id`),
	CONSTRAINT `faculties_code_unique` UNIQUE(`code`),
	CONSTRAINT `faculty_code_idx` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `import_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`importType` enum('devices','transfers','maintenance') NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`totalRecords` int NOT NULL,
	`successfulRecords` int NOT NULL,
	`failedRecords` int NOT NULL,
	`errors` json,
	`importedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `import_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `laboratories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`departmentId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`code` varchar(50) NOT NULL,
	`location` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `laboratories_id` PRIMARY KEY(`id`),
	CONSTRAINT `laboratories_code_unique` UNIQUE(`code`),
	CONSTRAINT `laboratory_code_idx` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `maintenance_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` int NOT NULL,
	`maintenanceRequestId` int,
	`maintenanceType` enum('periodic','emergency') NOT NULL,
	`technicianName` varchar(255) NOT NULL,
	`technicianId` int,
	`maintenanceDate` date NOT NULL,
	`cost` decimal(12,2),
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `maintenance_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `maintenance_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` int NOT NULL,
	`maintenanceType` enum('periodic','emergency') NOT NULL,
	`status` enum('requested','approved','in_progress','completed','cancelled') NOT NULL DEFAULT 'requested',
	`requestedBy` int NOT NULL,
	`assignedTo` int,
	`scheduledDate` timestamp,
	`completedDate` timestamp,
	`cost` decimal(12,2),
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `maintenance_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`maintenanceDueNotifications` boolean NOT NULL DEFAULT true,
	`maintenanceRequestNotifications` boolean NOT NULL DEFAULT true,
	`transferApprovedNotifications` boolean NOT NULL DEFAULT true,
	`endOfLifeAlerts` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `notification_preferences_userId_idx` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `transfers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deviceId` int NOT NULL,
	`fromLaboratoryId` int NOT NULL,
	`toLaboratoryId` int NOT NULL,
	`fromFacultyId` int NOT NULL,
	`toFacultyId` int NOT NULL,
	`transferDate` timestamp NOT NULL,
	`reason` text,
	`approvedBy` int,
	`approvalDate` timestamp,
	`notes` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transfers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','unit_manager','technician') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `facultyId` int;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `openId_idx` UNIQUE(`openId`);--> statement-breakpoint
CREATE INDEX `audit_logs_entityType_idx` ON `audit_logs` (`entityType`);--> statement-breakpoint
CREATE INDEX `audit_logs_entityId_idx` ON `audit_logs` (`entityId`);--> statement-breakpoint
CREATE INDEX `audit_logs_userId_idx` ON `audit_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `audit_logs_createdAt_idx` ON `audit_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `department_facultyId_idx` ON `departments` (`facultyId`);--> statement-breakpoint
CREATE INDEX `depreciation_records_deviceId_idx` ON `depreciation_records` (`deviceId`);--> statement-breakpoint
CREATE INDEX `depreciation_records_calculationDate_idx` ON `depreciation_records` (`calculationDate`);--> statement-breakpoint
CREATE INDEX `device_currentLaboratoryId_idx` ON `devices` (`currentLaboratoryId`);--> statement-breakpoint
CREATE INDEX `device_currentStatus_idx` ON `devices` (`currentStatus`);--> statement-breakpoint
CREATE INDEX `device_currentFacultyId_idx` ON `devices` (`currentFacultyId`);--> statement-breakpoint
CREATE INDEX `import_logs_importType_idx` ON `import_logs` (`importType`);--> statement-breakpoint
CREATE INDEX `import_logs_createdAt_idx` ON `import_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `laboratory_departmentId_idx` ON `laboratories` (`departmentId`);--> statement-breakpoint
CREATE INDEX `maintenance_history_deviceId_idx` ON `maintenance_history` (`deviceId`);--> statement-breakpoint
CREATE INDEX `maintenance_history_maintenanceDate_idx` ON `maintenance_history` (`maintenanceDate`);--> statement-breakpoint
CREATE INDEX `maintenance_request_deviceId_idx` ON `maintenance_requests` (`deviceId`);--> statement-breakpoint
CREATE INDEX `maintenance_request_status_idx` ON `maintenance_requests` (`status`);--> statement-breakpoint
CREATE INDEX `maintenance_request_assignedTo_idx` ON `maintenance_requests` (`assignedTo`);--> statement-breakpoint
CREATE INDEX `transfer_deviceId_idx` ON `transfers` (`deviceId`);--> statement-breakpoint
CREATE INDEX `transfer_transferDate_idx` ON `transfers` (`transferDate`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`role`);
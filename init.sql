CREATE TABLE IF NOT EXISTS `Roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE -- e.g., "client", "gym_admin", "super_admin"
);

CREATE TABLE IF NOT EXISTS `Users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `fullName` VARCHAR(255) NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL, -- Renamed from password
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  -- Removed nationalID, nationality, countryFlag
);

CREATE TABLE IF NOT EXISTS `UserRoles` (
  `userId` INT NOT NULL,
  `roleId` INT NOT NULL,
  PRIMARY KEY (`userId`, `roleId`),
  FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`roleId`) REFERENCES `Roles`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `Gyms` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `address` TEXT NULL,
  `contact_phone` VARCHAR(50) NULL,
  `contact_email` VARCHAR(255) NULL,
  `opening_hours_json` JSON NULL, -- Store as JSON for flexibility
  `facilities_description` TEXT NULL,
  `photos_json` JSON NULL, -- Array of image URLs
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_by_superadmin_id` INT NULL, -- User ID of superadmin who added it. Can be NULL if gym signs up itself (future feature)
  FOREIGN KEY (`created_by_superadmin_id`) REFERENCES `Users`(`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `GymAdmins` (
  `userId` INT NOT NULL,
  `gymId` INT NOT NULL,
  PRIMARY KEY (`userId`, `gymId`),
  FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`gymId`) REFERENCES `Gyms`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `Memberships` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `gymId` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL, -- e.g., "Gold Tier", "Monthly Basic"
  `description` TEXT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `duration` VARCHAR(100) NULL, -- e.g., "1 month", "1 year", "30 days"
  `duration_days` INT NULL, -- For easier calculation
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`gymId`) REFERENCES `Gyms`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `Orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `membershipId` INT NOT NULL,
  `orderDate` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `startDate` DATE NULL, -- Nullable until approved
  `endDate` DATE NULL,   -- Nullable until approved
  `price_paid` DECIMAL(10, 2) NOT NULL,
  `status` VARCHAR(50) NOT NULL, -- e.g., "pending_approval", "active", "expired", "cancelled"
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`membershipId`) REFERENCES `Memberships`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `Events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `gymId` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `event_date_time` TIMESTAMP NOT NULL,
  `location_details` VARCHAR(255) NULL, -- e.g., "Studio 1", "Online via Zoom"
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_by_gym_admin_id` INT NULL, 
  FOREIGN KEY (`gymId`) REFERENCES `Gyms`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by_gym_admin_id`) REFERENCES `Users`(`id`) ON DELETE SET NULL
);

-- Seed initial roles
INSERT INTO `Roles` (`name`) VALUES ('client'), ('gym_admin'), ('super_admin')
ON DUPLICATE KEY UPDATE name=name; -- Prevents error if roles already exist

-- Note: The old 'settings' table is removed as its functionality will be handled differently
-- or within specific gym settings if needed later.
-- Seed Superadmin User (Password: password123)
-- Note: The hash is for 'password123' using bcrypt with cost 12. Generate a new hash for a different password.
INSERT INTO `Users` (`fullName`, `email`, `password_hash`, `createdAt`) 
VALUES ('Super Admin', 'superadmin@example.com', '$2b$12$hd6MjRIsswAHm92zmwm3beHzrsfcXHxVHlhKxxnVyQrvwos1zG.ji', NOW())
ON DUPLICATE KEY UPDATE `fullName` = VALUES(`fullName`); -- Update name if email exists

-- Assign Superadmin Role
-- This assumes the user and role inserts above were successful or already existed.
INSERT INTO `UserRoles` (`userId`, `roleId`) 
SELECT 
    (SELECT `id` FROM `Users` WHERE `email` = 'superadmin@example.com'), 
    (SELECT `id` FROM `Roles` WHERE `name` = 'super_admin')
ON DUPLICATE KEY UPDATE `userId`=`userId`; -- Do nothing if assignment exists
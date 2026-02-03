/*
  Warnings:

  - You are about to drop the `Bid` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SearchRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SearchRequestProperty` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[bookingId]` on the table `ViewingRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Bid` DROP FOREIGN KEY `Bid_haunterId_fkey`;

-- DropForeignKey
ALTER TABLE `Bid` DROP FOREIGN KEY `Bid_searchRequestId_fkey`;

-- DropForeignKey
ALTER TABLE `SearchRequest` DROP FOREIGN KEY `SearchRequest_haunterId_fkey`;

-- DropForeignKey
ALTER TABLE `SearchRequest` DROP FOREIGN KEY `SearchRequest_tenantId_fkey`;

-- DropForeignKey
ALTER TABLE `SearchRequestProperty` DROP FOREIGN KEY `SearchRequestProperty_propertyId_fkey`;

-- DropForeignKey
ALTER TABLE `SearchRequestProperty` DROP FOREIGN KEY `SearchRequestProperty_searchRequestId_fkey`;

-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `hunterDone` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `hunterMetConfirmed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `hunterVisible` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `issueCreated` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `issueReporterId` VARCHAR(191) NULL,
    ADD COLUMN `issueStatus` VARCHAR(191) NULL DEFAULT 'PENDING',
    ADD COLUMN `tenantDone` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `tenantMetConfirmed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `tenantVisible` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `status` ENUM('CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED') NOT NULL DEFAULT 'CONFIRMED';

-- AlterTable
ALTER TABLE `Dispute` ADD COLUMN `hunterEvidenceUrl` LONGTEXT NULL,
    ADD COLUMN `hunterResponse` TEXT NULL;

-- AlterTable
ALTER TABLE `Property` ADD COLUMN `listingPackage` VARCHAR(191) NULL,
    ADD COLUMN `packageProperties` LONGTEXT NULL,
    ADD COLUMN `utilities` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `RescheduleRequest` ADD COLUMN `counterLocation` TEXT NULL,
    ADD COLUMN `proposedLocation` TEXT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `averageRating` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `reviewCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `workLocation` TEXT NULL;

-- AlterTable
ALTER TABLE `ViewingRequest` ADD COLUMN `bookingId` VARCHAR(191) NULL,
    ADD COLUMN `hunterVisible` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `tenantVisible` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE `Bid`;

-- DropTable
DROP TABLE `SearchRequest`;

-- DropTable
DROP TABLE `SearchRequestProperty`;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'info',
    `read` BOOLEAN NOT NULL DEFAULT false,
    `actionUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `ViewingRequest_bookingId_key` ON `ViewingRequest`(`bookingId`);

-- AddForeignKey
ALTER TABLE `ViewingRequest` ADD CONSTRAINT `ViewingRequest_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

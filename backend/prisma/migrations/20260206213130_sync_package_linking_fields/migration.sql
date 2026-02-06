-- AlterTable
ALTER TABLE `ViewingPackage` ADD COLUMN `packageGroupId` VARCHAR(191) NULL,
    ADD COLUMN `packageMasterId` VARCHAR(191) NULL,
    ADD COLUMN `packagePosition` INTEGER NULL;

-- CreateIndex
CREATE INDEX `ViewingPackage_packageGroupId_idx` ON `ViewingPackage`(`packageGroupId`);

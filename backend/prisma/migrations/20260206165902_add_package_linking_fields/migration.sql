-- AlterTable
ALTER TABLE `Property` ADD COLUMN `packageGroupId` VARCHAR(191) NULL,
    ADD COLUMN `packageMasterId` VARCHAR(191) NULL,
    ADD COLUMN `packagePosition` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Property_packageGroupId_idx` ON `Property`(`packageGroupId`);

-- CreateIndex
CREATE INDEX `Property_packageMasterId_idx` ON `Property`(`packageMasterId`);

-- AddForeignKey
ALTER TABLE `Property` ADD CONSTRAINT `Property_packageMasterId_fkey` FOREIGN KEY (`packageMasterId`) REFERENCES `Property`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `MeetingPoint` ADD COLUMN `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `ViewingRequest` ADD COLUMN `proposedLocation` LONGTEXT NULL;

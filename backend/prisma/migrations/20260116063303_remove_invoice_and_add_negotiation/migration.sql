-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('TENANT', 'HUNTER', 'ADMIN') NOT NULL DEFAULT 'TENANT',
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `verificationStatus` VARCHAR(191) NOT NULL DEFAULT 'UNVERIFIED',
    `avatarUrl` VARCHAR(191) NULL,
    `idFrontUrl` VARCHAR(191) NULL,
    `idBackUrl` VARCHAR(191) NULL,
    `selfieUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Property` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `rent` DOUBLE NOT NULL,
    `location` JSON NOT NULL,
    `amenities` JSON NOT NULL,
    `images` JSON NOT NULL,
    `videos` JSON NULL,
    `status` ENUM('PENDING_APPROVAL', 'AVAILABLE', 'LOCKED', 'RENTED', 'REJECTED') NOT NULL DEFAULT 'PENDING_APPROVAL',
    `isExactLocation` BOOLEAN NOT NULL DEFAULT false,
    `isLocked` BOOLEAN NOT NULL DEFAULT false,
    `adminApprovedBy` VARCHAR(191) NULL,
    `adminApprovedAt` DATETIME(3) NULL,
    `rejectionReason` TEXT NULL,
    `hunterId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ViewingPackage` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `description` VARCHAR(191) NULL,
    `tier` ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM') NOT NULL,
    `propertiesIncluded` INTEGER NOT NULL,
    `features` JSON NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ViewingRequest` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `proposedDates` JSON NOT NULL,
    `message` TEXT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `amount` DOUBLE NULL,
    `paymentStatus` ENUM('UNPAID', 'PAID', 'ESCROW', 'RELEASED', 'REFUNDED') NOT NULL DEFAULT 'UNPAID',
    `packageId` VARCHAR(191) NULL,
    `counterDate` VARCHAR(191) NULL,
    `counterTime` VARCHAR(191) NULL,
    `counterLocation` JSON NULL,
    `counteredBy` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `hunterId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `paymentStatus` ENUM('UNPAID', 'PAID', 'ESCROW', 'RELEASED', 'REFUNDED') NOT NULL DEFAULT 'ESCROW',
    `scheduledDate` VARCHAR(191) NOT NULL,
    `scheduledTime` VARCHAR(191) NOT NULL,
    `scheduledEndTime` VARCHAR(191) NOT NULL,
    `actualStartTime` DATETIME(3) NULL,
    `actualEndTime` DATETIME(3) NULL,
    `autoReleaseAt` DATETIME(3) NULL,
    `tenantConfirmed` BOOLEAN NOT NULL DEFAULT false,
    `physicalMeetingConfirmed` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    `chatEnabled` BOOLEAN NOT NULL DEFAULT true,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `type` ENUM('TENANT_TO_HUNTER', 'HUNTER_TO_TENANT') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NULL,
    `bookingId` VARCHAR(191) NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `receiverId` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NULL,
    `content` TEXT NULL,
    `type` ENUM('TEXT', 'IMAGE', 'VIDEO', 'FILE', 'VOICE_CALL', 'VIDEO_CALL') NOT NULL DEFAULT 'TEXT',
    `fileUrl` VARCHAR(191) NULL,
    `fileName` VARCHAR(191) NULL,
    `fileSize` INTEGER NULL,
    `callDuration` INTEGER NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Message_senderId_idx`(`senderId`),
    INDEX `Message_receiverId_idx`(`receiverId`),
    INDEX `Message_bookingId_idx`(`bookingId`),
    INDEX `Message_conversationId_idx`(`conversationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SearchRequest` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `preferredAreas` JSON NOT NULL,
    `minRent` DOUBLE NOT NULL,
    `maxRent` DOUBLE NOT NULL,
    `moveInDate` DATETIME(3) NULL,
    `leaseDuration` VARCHAR(191) NOT NULL,
    `propertyType` VARCHAR(191) NOT NULL,
    `bathrooms` INTEGER NOT NULL,
    `furnished` VARCHAR(191) NOT NULL,
    `petFriendly` BOOLEAN NOT NULL,
    `parkingRequired` BOOLEAN NOT NULL,
    `parkingSpaces` INTEGER NULL,
    `securityFeatures` JSON NOT NULL,
    `utilitiesIncluded` JSON NOT NULL,
    `amenities` JSON NOT NULL,
    `mustHaveFeatures` JSON NOT NULL,
    `niceToHaveFeatures` JSON NOT NULL,
    `dealBreakers` JSON NOT NULL,
    `additionalNotes` TEXT NULL,
    `serviceTier` ENUM('STANDARD', 'PREMIUM', 'URGENT') NOT NULL,
    `numberOfOptions` INTEGER NOT NULL,
    `depositAmount` DOUBLE NOT NULL,
    `status` ENUM('DRAFT', 'PENDING_PAYMENT', 'PENDING_BIDS', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED', 'CANCELLED', 'FORFEITED') NOT NULL DEFAULT 'DRAFT',
    `selectedBidId` VARCHAR(191) NULL,
    `haunterId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bid` (
    `id` VARCHAR(191) NOT NULL,
    `searchRequestId` VARCHAR(191) NOT NULL,
    `haunterId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `message` TEXT NULL,
    `timeframe` INTEGER NOT NULL,
    `bonuses` JSON NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SearchRequestProperty` (
    `id` VARCHAR(191) NOT NULL,
    `searchRequestId` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `matchScore` INTEGER NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dispute` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `priority` VARCHAR(191) NOT NULL DEFAULT 'medium',
    `reporterId` VARCHAR(191) NOT NULL,
    `againstId` VARCHAR(191) NULL,
    `bookingId` VARCHAR(191) NULL,
    `propertyId` VARCHAR(191) NULL,
    `resolution` TEXT NULL,
    `evidenceUrls` JSON NULL,
    `evidenceDescription` TEXT NULL,
    `resolvedBy` VARCHAR(191) NULL,
    `resolvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Conversation` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `hunterId` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NULL,
    `lastMessage` TEXT NULL,
    `lastMessageAt` DATETIME(3) NULL,
    `unreadCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Conversation_tenantId_hunterId_propertyId_key`(`tenantId`, `hunterId`, `propertyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SavedProperty` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `SavedProperty_userId_propertyId_key`(`userId`, `propertyId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentHistory` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `type` ENUM('BOOKING_PAYMENT', 'WITHDRAWAL', 'REFUND') NOT NULL,
    `mpesaReceiptNumber` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL,
    `description` TEXT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HunterEarnings` (
    `id` VARCHAR(191) NOT NULL,
    `hunterId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'WITHDRAWN') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MeetingPoint` (
    `id` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `type` ENUM('LANDMARK', 'PROPERTY') NOT NULL DEFAULT 'LANDMARK',
    `location` JSON NOT NULL,
    `sharedBy` VARCHAR(191) NOT NULL,
    `sharedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tenantViewed` BOOLEAN NOT NULL DEFAULT false,
    `tenantViewedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MeetingPoint_bookingId_key`(`bookingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RescheduleRequest` (
    `id` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `requestedBy` VARCHAR(191) NOT NULL,
    `proposedDate` VARCHAR(191) NOT NULL,
    `proposedTime` VARCHAR(191) NOT NULL,
    `proposedEndTime` VARCHAR(191) NOT NULL,
    `reason` TEXT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED') NOT NULL DEFAULT 'PENDING',
    `counterDate` VARCHAR(191) NULL,
    `counterTime` VARCHAR(191) NULL,
    `counterEndTime` VARCHAR(191) NULL,
    `counterReason` TEXT NULL,
    `respondedBy` VARCHAR(191) NULL,
    `respondedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Property` ADD CONSTRAINT `Property_hunterId_fkey` FOREIGN KEY (`hunterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ViewingPackage` ADD CONSTRAINT `ViewingPackage_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ViewingRequest` ADD CONSTRAINT `ViewingRequest_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ViewingRequest` ADD CONSTRAINT `ViewingRequest_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_hunterId_fkey` FOREIGN KEY (`hunterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SearchRequest` ADD CONSTRAINT `SearchRequest_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SearchRequest` ADD CONSTRAINT `SearchRequest_haunterId_fkey` FOREIGN KEY (`haunterId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bid` ADD CONSTRAINT `Bid_searchRequestId_fkey` FOREIGN KEY (`searchRequestId`) REFERENCES `SearchRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bid` ADD CONSTRAINT `Bid_haunterId_fkey` FOREIGN KEY (`haunterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SearchRequestProperty` ADD CONSTRAINT `SearchRequestProperty_searchRequestId_fkey` FOREIGN KEY (`searchRequestId`) REFERENCES `SearchRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SearchRequestProperty` ADD CONSTRAINT `SearchRequestProperty_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dispute` ADD CONSTRAINT `Dispute_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dispute` ADD CONSTRAINT `Dispute_againstId_fkey` FOREIGN KEY (`againstId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dispute` ADD CONSTRAINT `Dispute_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dispute` ADD CONSTRAINT `Dispute_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_hunterId_fkey` FOREIGN KEY (`hunterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedProperty` ADD CONSTRAINT `SavedProperty_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedProperty` ADD CONSTRAINT `SavedProperty_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentHistory` ADD CONSTRAINT `PaymentHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HunterEarnings` ADD CONSTRAINT `HunterEarnings_hunterId_fkey` FOREIGN KEY (`hunterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HunterEarnings` ADD CONSTRAINT `HunterEarnings_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MeetingPoint` ADD CONSTRAINT `MeetingPoint_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RescheduleRequest` ADD CONSTRAINT `RescheduleRequest_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

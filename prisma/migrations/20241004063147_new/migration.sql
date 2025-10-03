-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `shop` TEXT NOT NULL,
    `state` TEXT NOT NULL,
    `isOnline` BOOLEAN NOT NULL DEFAULT false,
    `scope` TEXT NULL,
    `expires` DATETIME(3) NULL,
    `accessToken` TEXT NOT NULL,
    `userId` BIGINT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriptionData` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assignedPricingPolicy` TEXT NOT NULL,
    `billingPolicy` TEXT NOT NULL,
    `createdAt` TEXT NOT NULL,
    `currencyCode` TEXT NOT NULL,
    `customAttributes` TEXT NOT NULL,
    `customer` TEXT NOT NULL,
    `customerLtv` TEXT NOT NULL,
    `customerPaymentMethod` TEXT NOT NULL,
    `deliveryMethod` TEXT NOT NULL,
    `deliveryPrice` TEXT NOT NULL,
    `discounts` TEXT NOT NULL,
    `isInDunning` TEXT NOT NULL,
    `lastChargeDate` TEXT NOT NULL,
    `lineCount` TEXT NOT NULL,
    `lines` TEXT NOT NULL,
    `nextBillingDate` TEXT NOT NULL,
    `scheduledBillingDate` TEXT NOT NULL,
    `sellingPlanGroupData` TEXT NOT NULL,
    `shopifyCustomerId` TEXT NOT NULL,
    `shopifyCustomerEmail` TEXT NOT NULL,
    `shopifyOrders` TEXT NOT NULL,
    `status` TEXT NOT NULL,
    `subscriptionId` TEXT NOT NULL,
    `subscriptionIdString` VARCHAR(191) NOT NULL,
    `subscriptionLtv` TEXT NOT NULL,
    `updatedAt` TEXT NOT NULL,

    UNIQUE INDEX `subscriptionData_subscriptionIdString_key`(`subscriptionIdString`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

/*
  Warnings:

  - You are about to drop the column `avgReview` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Cart` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('FIXED', 'FLEXIBLE');

-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_productId_fkey";

-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_userId_fkey";

-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_vendorId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "avgReview",
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'FLEXIBLE';

-- DropTable
DROP TABLE "Cart";

-- CreateTable
CREATE TABLE "ProductFixedTimeSlot" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "ProductFixedTimeSlot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductFixedTimeSlot" ADD CONSTRAINT "ProductFixedTimeSlot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

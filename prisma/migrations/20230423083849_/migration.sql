/*
  Warnings:

  - The primary key for the `Cart` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `username` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `Ledger` table. All the data in the column will be lost.
  - You are about to drop the column `vendorUsername` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `confirmationCode` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `confirmationCode` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Ledger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendorId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `confirmationCode` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_username_fkey";

-- DropForeignKey
ALTER TABLE "Ledger" DROP CONSTRAINT "Ledger_username_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_vendorUsername_fkey";

-- DropForeignKey
ALTER TABLE "confirmationCode" DROP CONSTRAINT "confirmationCode_username_fkey";

-- DropIndex
DROP INDEX "confirmationCode_username_key";

-- AlterTable
ALTER TABLE "Cart" DROP CONSTRAINT "Cart_pkey",
DROP COLUMN "username",
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "Cart_pkey" PRIMARY KEY ("userId", "productId");

-- AlterTable
ALTER TABLE "Ledger" DROP COLUMN "username",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "vendorUsername",
ADD COLUMN     "vendorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "confirmationCode" DROP COLUMN "username",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "confirmationCode_userId_key" ON "confirmationCode"("userId");

-- AddForeignKey
ALTER TABLE "confirmationCode" ADD CONSTRAINT "confirmationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

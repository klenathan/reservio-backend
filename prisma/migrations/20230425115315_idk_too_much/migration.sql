/*
  Warnings:

  - You are about to drop the column `vendorId` on the `Reservation` table. All the data in the column will be lost.
  - Added the required column `productId` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_vendorId_fkey";

-- AlterTable
ALTER TABLE "ProuctReservation" ADD COLUMN     "productFixedTimeSlotId" TEXT;

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "vendorId",
ADD COLUMN     "productId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProuctReservation" ADD CONSTRAINT "ProuctReservation_productFixedTimeSlotId_fkey" FOREIGN KEY ("productFixedTimeSlotId") REFERENCES "ProductFixedTimeSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

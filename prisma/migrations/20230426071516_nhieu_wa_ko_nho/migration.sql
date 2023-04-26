/*
  Warnings:

  - You are about to drop the `ProuctReservation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `quantity` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProuctReservation" DROP CONSTRAINT "ProuctReservation_productFixedTimeSlotId_fkey";

-- DropForeignKey
ALTER TABLE "ProuctReservation" DROP CONSTRAINT "ProuctReservation_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProuctReservation" DROP CONSTRAINT "ProuctReservation_reservationId_fkey";

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "endAt" TIMESTAMP(3),
ADD COLUMN     "productFixedTimeSlotId" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "startAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "ProuctReservation";

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_productFixedTimeSlotId_fkey" FOREIGN KEY ("productFixedTimeSlotId") REFERENCES "ProductFixedTimeSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

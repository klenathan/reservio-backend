/*
  Warnings:

  - Added the required column `discountId` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "discountId" TEXT NOT NULL,
ADD COLUMN     "total" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "ProuctReservation" (
    "productId" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProuctReservation_pkey" PRIMARY KEY ("productId","reservationId")
);

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProuctReservation" ADD CONSTRAINT "ProuctReservation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProuctReservation" ADD CONSTRAINT "ProuctReservation_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

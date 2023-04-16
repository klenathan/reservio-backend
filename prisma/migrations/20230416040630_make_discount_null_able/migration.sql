-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_discountId_fkey";

-- AlterTable
ALTER TABLE "Reservation" ALTER COLUMN "discountId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "Discount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

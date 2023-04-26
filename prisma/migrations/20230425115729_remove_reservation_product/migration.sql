-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_productId_fkey";

-- AlterTable
ALTER TABLE "Reservation" ALTER COLUMN "productId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

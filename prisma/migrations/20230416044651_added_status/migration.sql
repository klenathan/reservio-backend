-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'REJECTED', 'ACCEPTED');

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING';

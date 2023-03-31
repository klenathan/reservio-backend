-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVATE', 'BANNED', 'DEACTIVATE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVATE';

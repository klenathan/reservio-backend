/*
  Warnings:

  - You are about to drop the column `category` on the `Ledger` table. All the data in the column will be lost.
  - Added the required column `ip` to the `Ledger` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Ledger" DROP CONSTRAINT "Ledger_userId_fkey";

-- AlterTable
ALTER TABLE "Ledger" DROP COLUMN "category",
ADD COLUMN     "ip" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

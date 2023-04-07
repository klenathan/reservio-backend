/*
  Warnings:

  - Added the required column `amount` to the `Discount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Discount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Discount" ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "desc" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

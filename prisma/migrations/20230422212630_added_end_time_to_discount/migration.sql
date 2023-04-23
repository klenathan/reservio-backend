/*
  Warnings:

  - Added the required column `end` to the `Discount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Discount" ADD COLUMN     "end" TIMESTAMP(3) NOT NULL;

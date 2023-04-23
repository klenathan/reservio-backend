/*
  Warnings:

  - Added the required column `image` to the `Discount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Discount" ADD COLUMN     "image" TEXT NOT NULL;

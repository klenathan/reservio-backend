-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Healthcare', 'Transportation', 'Legal', 'Financial', 'Education', 'Maintenance_N_repair', 'F_N_B', 'Retail', 'Hospitality');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'Hospitality';

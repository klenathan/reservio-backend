-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "category" "Category"[] DEFAULT ARRAY['Hospitality']::"Category"[];

-- CreateTable
CREATE TABLE "Ledger" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "path" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "category" "Category" NOT NULL,

    CONSTRAINT "Ledger_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ledger" ADD CONSTRAINT "Ledger_username_fkey" FOREIGN KEY ("username") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

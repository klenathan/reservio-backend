/*
  Warnings:

  - You are about to drop the `confirmationCode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "confirmationCode" DROP CONSTRAINT "confirmationCode_userId_fkey";

-- DropTable
DROP TABLE "confirmationCode";

-- CreateTable
CREATE TABLE "ConfirmationCode" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "confirmCode" TEXT NOT NULL,

    CONSTRAINT "ConfirmationCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfirmationCode_userId_key" ON "ConfirmationCode"("userId");

-- AddForeignKey
ALTER TABLE "ConfirmationCode" ADD CONSTRAINT "ConfirmationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

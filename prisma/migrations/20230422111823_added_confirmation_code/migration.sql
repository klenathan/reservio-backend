-- CreateTable
CREATE TABLE "confirmationCode" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "confirmCode" TEXT NOT NULL,

    CONSTRAINT "confirmationCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "confirmationCode_username_key" ON "confirmationCode"("username");

-- AddForeignKey
ALTER TABLE "confirmationCode" ADD CONSTRAINT "confirmationCode_username_fkey" FOREIGN KEY ("username") REFERENCES "users"("username") ON DELETE RESTRICT ON UPDATE CASCADE;

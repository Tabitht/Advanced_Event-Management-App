/*
  Warnings:

  - A unique constraint covering the columns `[hashedToken]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "MeetHive_Schema"."Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "MeetHive_Schema"."Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_organizerId_key" ON "MeetHive_Schema"."Subscription"("organizerId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_hashedToken_key" ON "MeetHive_Schema"."RefreshToken"("hashedToken");

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "MeetHive_Schema"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."Subscription" ADD CONSTRAINT "Subscription_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "MeetHive_Schema"."Organizer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

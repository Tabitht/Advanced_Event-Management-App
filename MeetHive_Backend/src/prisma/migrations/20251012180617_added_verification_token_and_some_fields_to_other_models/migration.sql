/*
  Warnings:

  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hashedToken]` on the table `ResetToken` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "MeetHive_Schema"."Event" DROP CONSTRAINT "Event_organizerId_fkey";

-- DropForeignKey
ALTER TABLE "MeetHive_Schema"."Organizer" DROP CONSTRAINT "Organizer_userId_fkey";

-- DropForeignKey
ALTER TABLE "MeetHive_Schema"."RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "MeetHive_Schema"."ResetToken" DROP CONSTRAINT "ResetToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "MeetHive_Schema"."Subscription" DROP CONSTRAINT "Subscription_organizerId_fkey";

-- DropForeignKey
ALTER TABLE "MeetHive_Schema"."Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- AlterTable
ALTER TABLE "MeetHive_Schema"."Event" ADD COLUMN     "isArchived" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "MeetHive_Schema"."Subscription" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "MeetHive_Schema"."User" DROP COLUMN "bio",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "MeetHive_Schema"."VerificationToken" (
    "id" TEXT NOT NULL,
    "hashedToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_hashedToken_key" ON "MeetHive_Schema"."VerificationToken"("hashedToken");

-- CreateIndex
CREATE UNIQUE INDEX "ResetToken_hashedToken_key" ON "MeetHive_Schema"."ResetToken"("hashedToken");

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."Event" ADD CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "MeetHive_Schema"."Organizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."Organizer" ADD CONSTRAINT "Organizer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "MeetHive_Schema"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "MeetHive_Schema"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."Subscription" ADD CONSTRAINT "Subscription_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "MeetHive_Schema"."Organizer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "MeetHive_Schema"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."ResetToken" ADD CONSTRAINT "ResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "MeetHive_Schema"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetHive_Schema"."VerificationToken" ADD CONSTRAINT "VerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "MeetHive_Schema"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

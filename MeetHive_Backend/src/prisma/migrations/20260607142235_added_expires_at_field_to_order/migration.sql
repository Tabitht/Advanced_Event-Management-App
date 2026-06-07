/*
  Warnings:

  - Added the required column `expiresAt` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MeetHive_Schema"."Order" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;

/*
  Warnings:

  - You are about to drop the column `createdAt` on the `PlanMember` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `PlanMember` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PlanMember` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD';

-- AlterTable
ALTER TABLE "PlanMember" DROP COLUMN "createdAt",
DROP COLUMN "status",
DROP COLUMN "updatedAt",
ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "username";

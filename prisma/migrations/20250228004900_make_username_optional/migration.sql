/*
  Warnings:

  - You are about to drop the column `currency` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `joinedAt` on the `PlanMember` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `PlanMember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "currency";

-- AlterTable
ALTER TABLE "PlanMember" DROP COLUMN "joinedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "username" TEXT NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "renewalFrequency" TEXT NOT NULL,
    "maxMembers" INTEGER NOT NULL,
    "currentMembers" INTEGER NOT NULL DEFAULT 1,
    "ownerId" TEXT NOT NULL,
    "nextRenewalDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Plan_ownerId_idx" ON "Plan"("ownerId");

-- CreateIndex
CREATE INDEX "PlanMember_userId_idx" ON "PlanMember"("userId");

-- CreateIndex
CREATE INDEX "PlanMember_planId_idx" ON "PlanMember"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanMember_userId_planId_key" ON "PlanMember"("userId", "planId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanMember" ADD CONSTRAINT "PlanMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanMember" ADD CONSTRAINT "PlanMember_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

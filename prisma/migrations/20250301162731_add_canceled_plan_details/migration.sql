-- AlterTable
ALTER TABLE "CanceledPlan" ADD COLUMN     "memberCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "originalPlanId" TEXT,
ADD COLUMN     "wasOwner" BOOLEAN NOT NULL DEFAULT true;

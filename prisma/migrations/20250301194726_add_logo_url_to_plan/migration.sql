/*
  Warnings:

  - You are about to drop the column `category` on the `CanceledPlan` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CanceledPlan" DROP COLUMN "category";

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "category",
ADD COLUMN     "logoUrl" TEXT;

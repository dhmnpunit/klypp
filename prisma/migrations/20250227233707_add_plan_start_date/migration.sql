/*
  Warnings:

  - Added the required column `startDate` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- First add the column as nullable
ALTER TABLE "Plan" ADD COLUMN "startDate" TIMESTAMP(3);

-- Update existing records to use createdAt as startDate
UPDATE "Plan" SET "startDate" = "createdAt" WHERE "startDate" IS NULL;

-- Now make the column required
ALTER TABLE "Plan" ALTER COLUMN "startDate" SET NOT NULL;

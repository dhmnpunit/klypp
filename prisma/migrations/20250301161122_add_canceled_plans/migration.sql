-- CreateTable
CREATE TABLE "CanceledPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "renewalFrequency" TEXT NOT NULL,
    "canceledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CanceledPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CanceledPlan_userId_idx" ON "CanceledPlan"("userId");

-- AddForeignKey
ALTER TABLE "CanceledPlan" ADD CONSTRAINT "CanceledPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

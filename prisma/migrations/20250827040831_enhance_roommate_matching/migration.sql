/*
  Warnings:

  - You are about to drop the column `preferences` on the `RoommateRequest` table. All the data in the column will be lost.
  - Added the required column `budget` to the `RoommateRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cleaningHabits` to the `RoommateRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `RoommateRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `guestHabits` to the `RoommateRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `RoommateRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moveInDate` to the `RoommateRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `petPreference` to the `RoommateRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `smokingTolerance` to the `RoommateRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `RoommateRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workSchedule` to the `RoommateRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."RoommateRequest" DROP COLUMN "preferences",
ADD COLUMN     "budget" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "cleaningHabits" TEXT NOT NULL,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "guestHabits" TEXT NOT NULL,
ADD COLUMN     "lifestyle" TEXT[],
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "moveInDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "petPreference" TEXT NOT NULL,
ADD COLUMN     "smokingTolerance" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "workSchedule" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."RoommateMatch" (
    "id" SERIAL NOT NULL,
    "requestOneId" INTEGER NOT NULL,
    "requestTwoId" INTEGER NOT NULL,
    "compatibilityScore" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoommateMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoommateMatch_requestOneId_requestTwoId_key" ON "public"."RoommateMatch"("requestOneId", "requestTwoId");

-- AddForeignKey
ALTER TABLE "public"."RoommateMatch" ADD CONSTRAINT "RoommateMatch_requestOneId_fkey" FOREIGN KEY ("requestOneId") REFERENCES "public"."RoommateRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoommateMatch" ADD CONSTRAINT "RoommateMatch_requestTwoId_fkey" FOREIGN KEY ("requestTwoId") REFERENCES "public"."RoommateRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

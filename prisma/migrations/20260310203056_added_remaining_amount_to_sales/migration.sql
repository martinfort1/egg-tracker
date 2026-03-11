/*
  Warnings:

  - Added the required column `remainingAmount` to the `Sale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "remainingAmount" DOUBLE PRECISION NOT NULL;

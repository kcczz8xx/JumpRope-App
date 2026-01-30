/*
  Warnings:

  - You are about to drop the column `chargingModel` on the `school_courses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "school_courses" DROP COLUMN "chargingModel",
ADD COLUMN     "chargingModels" "ChargingModel"[] DEFAULT ARRAY[]::"ChargingModel"[];

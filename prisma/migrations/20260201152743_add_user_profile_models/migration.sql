/*
  Warnings:

  - You are about to drop the column `certifications` on the `tutor_profiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[memberNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('VALID', 'EXPIRED', 'EXPIRING_SOON', 'PENDING', 'NOT_SUBMITTED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('SEXUAL_CONVICTION_CHECK', 'FIRST_AID_CERTIFICATE', 'IDENTITY_DOCUMENT', 'COACHING_CERTIFICATE', 'OTHER_CERTIFICATE');

-- AlterTable
ALTER TABLE "tutor_profiles" DROP COLUMN "certifications";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "gender" "Gender",
ADD COLUMN     "identityCardNumber" TEXT,
ADD COLUMN     "memberNumber" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "user_addresses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "district" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_bank_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "accountHolderName" TEXT,
    "fpsId" TEXT,
    "fpsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_children" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "memberNumber" TEXT,
    "nameChinese" TEXT NOT NULL,
    "nameEnglish" TEXT,
    "birthYear" INTEGER,
    "school" TEXT,
    "gender" "Gender",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "user_children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor_documents" (
    "id" TEXT NOT NULL,
    "tutorProfileId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "referenceNumber" TEXT,
    "certificateType" TEXT,
    "issuingBody" TEXT,
    "issueDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "documentUrl" TEXT,
    "uploadDate" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutor_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_addresses_userId_key" ON "user_addresses"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_bank_accounts_userId_key" ON "user_bank_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_children_memberNumber_key" ON "user_children"("memberNumber");

-- CreateIndex
CREATE INDEX "user_children_parentId_idx" ON "user_children"("parentId");

-- CreateIndex
CREATE INDEX "tutor_documents_tutorProfileId_idx" ON "tutor_documents"("tutorProfileId");

-- CreateIndex
CREATE INDEX "tutor_documents_documentType_idx" ON "tutor_documents"("documentType");

-- CreateIndex
CREATE INDEX "tutor_documents_status_idx" ON "tutor_documents"("status");

-- CreateIndex
CREATE UNIQUE INDEX "users_memberNumber_key" ON "users"("memberNumber");

-- AddForeignKey
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_bank_accounts" ADD CONSTRAINT "user_bank_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_children" ADD CONSTRAINT "user_children_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_documents" ADD CONSTRAINT "tutor_documents_tutorProfileId_fkey" FOREIGN KEY ("tutorProfileId") REFERENCES "tutor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

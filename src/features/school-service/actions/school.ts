"use server";

/**
 * School Service Actions - 學校管理
 */

import { prisma } from "@/lib/db";
import { safeAction, success, failure, requireUser } from "@/lib/actions";
import { createSchoolSchema, updateSchoolSchema } from "../schemas/school";

export const createSchoolAction = safeAction(createSchoolSchema, async (input) => {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const {
    schoolName,
    schoolNameEn,
    address,
    phone,
    email,
    website,
    partnershipStartDate,
    partnershipEndDate,
    partnershipStartYear,
    confirmationChannel,
    remarks,
  } = input;

  const school = await prisma.school.create({
    data: {
      schoolName: schoolName.trim(),
      schoolNameEn: schoolNameEn || undefined,
      address: address || "",
      phone: phone || null,
      email: email || null,
      website: website || null,
      partnershipStartDate: partnershipStartDate ? new Date(partnershipStartDate) : null,
      partnershipEndDate: partnershipEndDate ? new Date(partnershipEndDate) : null,
      partnershipStartYear: partnershipStartYear || null,
      confirmationChannel: confirmationChannel || null,
      remarks: remarks || null,
      partnershipStatus: "CONFIRMED",
    },
  });

  return success({ message: "學校建立成功", school });
});

export const updateSchoolAction = safeAction(updateSchoolSchema, async (input) => {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const { id, ...updateData } = input;

  const existingSchool = await prisma.school.findUnique({
    where: { id },
  });

  if (!existingSchool || existingSchool.deletedAt) {
    return failure("NOT_FOUND", "學校不存在");
  }

  const data: Record<string, unknown> = {};

  if (updateData.schoolName !== undefined) data.schoolName = updateData.schoolName;
  if (updateData.schoolNameEn !== undefined) data.schoolNameEn = updateData.schoolNameEn || null;
  if (updateData.address !== undefined) data.address = updateData.address || null;
  if (updateData.phone !== undefined) data.phone = updateData.phone || null;
  if (updateData.email !== undefined) data.email = updateData.email || null;
  if (updateData.website !== undefined) data.website = updateData.website || null;
  if (updateData.partnershipStartDate !== undefined) {
    data.partnershipStartDate = updateData.partnershipStartDate
      ? new Date(updateData.partnershipStartDate)
      : null;
  }
  if (updateData.partnershipEndDate !== undefined) {
    data.partnershipEndDate = updateData.partnershipEndDate
      ? new Date(updateData.partnershipEndDate)
      : null;
  }
  if (updateData.partnershipStartYear !== undefined) {
    data.partnershipStartYear = updateData.partnershipStartYear || null;
  }
  if (updateData.confirmationChannel !== undefined) {
    data.confirmationChannel = updateData.confirmationChannel || null;
  }
  if (updateData.remarks !== undefined) data.remarks = updateData.remarks || null;

  const school = await prisma.school.update({
    where: { id },
    data,
  });

  return success({ message: "學校資料更新成功", school });
});

export async function deleteSchoolAction(id: string) {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  if (!id) {
    return failure("VALIDATION_ERROR", "缺少學校 ID");
  }

  const existingSchool = await prisma.school.findUnique({
    where: { id },
  });

  if (!existingSchool || existingSchool.deletedAt) {
    return failure("NOT_FOUND", "學校不存在");
  }

  await prisma.school.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return success({ message: "學校已刪除" });
}

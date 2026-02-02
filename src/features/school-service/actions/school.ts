"use server";

/**
 * School Service Actions - 學校管理
 *
 * 使用 createAction wrapper 自動處理：
 * - Schema 驗證
 * - 認證檢查
 * - 審計日誌
 * - 錯誤處理
 */

import { prisma } from "@/lib/db";
import { createAction, success } from "@/lib/patterns";
import { failureFromCode } from "@/features/_core/error-codes";
import {
  createSchoolSchema,
  updateSchoolSchema,
  type CreateSchoolInput,
  type UpdateSchoolInput,
} from "../schemas/school";
import type { School } from "@prisma/client";
import { z } from "zod";

const deleteSchoolSchema = z.object({
  id: z.string().min(1, "缺少學校 ID"),
});
type DeleteSchoolInput = z.infer<typeof deleteSchoolSchema>;

/**
 * 建立學校
 */
export const createSchoolAction = createAction<
  CreateSchoolInput,
  { message: string; school: School }
>(
  async (input, ctx) => {
    if (!ctx.session?.user) {
      return failureFromCode("PERMISSION", "UNAUTHORIZED");
    }

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
        partnershipStartDate: partnershipStartDate
          ? new Date(partnershipStartDate)
          : null,
        partnershipEndDate: partnershipEndDate
          ? new Date(partnershipEndDate)
          : null,
        partnershipStartYear: partnershipStartYear || null,
        confirmationChannel: confirmationChannel || null,
        remarks: remarks || null,
        partnershipStatus: "CONFIRMED",
      },
    });

    return success({ message: "學校建立成功", school });
  },
  {
    schema: createSchoolSchema,
    requireAuth: true,
    audit: true,
    auditAction: "SCHOOL_CREATE",
    auditResource: "school",
    auditResourceId: () => undefined,
  }
);

/**
 * 更新學校資料
 */
export const updateSchoolAction = createAction<
  UpdateSchoolInput,
  { message: string; school: School }
>(
  async (input, ctx) => {
    if (!ctx.session?.user) {
      return failureFromCode("PERMISSION", "UNAUTHORIZED");
    }

    const { id, ...updateData } = input;

    const existingSchool = await prisma.school.findUnique({
      where: { id },
    });

    if (!existingSchool || existingSchool.deletedAt) {
      return failureFromCode("RESOURCE", "NOT_FOUND");
    }

    const data: Record<string, unknown> = {};

    if (updateData.schoolName !== undefined)
      data.schoolName = updateData.schoolName;
    if (updateData.schoolNameEn !== undefined)
      data.schoolNameEn = updateData.schoolNameEn || null;
    if (updateData.address !== undefined)
      data.address = updateData.address || null;
    if (updateData.phone !== undefined) data.phone = updateData.phone || null;
    if (updateData.email !== undefined) data.email = updateData.email || null;
    if (updateData.website !== undefined)
      data.website = updateData.website || null;
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
    if (updateData.remarks !== undefined)
      data.remarks = updateData.remarks || null;

    const school = await prisma.school.update({
      where: { id },
      data,
    });

    return success({ message: "學校資料更新成功", school });
  },
  {
    schema: updateSchoolSchema,
    requireAuth: true,
    audit: true,
    auditAction: "SCHOOL_UPDATE",
    auditResource: "school",
    auditResourceId: (input) => input.id,
  }
);

/**
 * 刪除學校（軟刪除）
 */
export const deleteSchoolAction = createAction<
  DeleteSchoolInput,
  { message: string }
>(
  async (input, ctx) => {
    if (!ctx.session?.user) {
      return failureFromCode("PERMISSION", "UNAUTHORIZED");
    }

    const { id } = input;

    const existingSchool = await prisma.school.findUnique({
      where: { id },
    });

    if (!existingSchool || existingSchool.deletedAt) {
      return failureFromCode("RESOURCE", "NOT_FOUND");
    }

    await prisma.school.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return success({ message: "學校已刪除" });
  },
  {
    schema: deleteSchoolSchema,
    requireAuth: true,
    audit: true,
    auditAction: "SCHOOL_DELETE",
    auditResource: "school",
    auditResourceId: (input) => input.id,
  }
);

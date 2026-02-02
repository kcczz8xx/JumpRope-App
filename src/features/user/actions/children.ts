"use server";

/**
 * User Actions - Children
 * 學員管理操作
 *
 * 使用 createAction wrapper 自動處理：
 * - Schema 驗證
 * - 認證檢查
 * - 審計日誌
 * - 錯誤處理
 */

import { prisma } from "@/lib/db";
import { createAction, success, failure } from "@/lib/patterns";
import { rateLimit, RATE_LIMIT_CONFIGS } from "@/lib/server";
import { createChildWithMemberNumber } from "@/lib/services";
import {
  createChildSchema,
  updateChildSchema,
  deleteChildSchema,
  type CreateChildInput,
  type UpdateChildInput,
  type DeleteChildInput,
} from "../schemas/children";
import { getClientIP } from "./_helpers";

/**
 * 新增學員
 */
export const createChildAction = createAction<
  CreateChildInput,
  { message: string; child: { id: string; memberNumber: string; nameChinese: string; nameEnglish: string | null; birthYear: number | null; school: string | null; gender: string | null } }
>(
  async (input, ctx) => {
    // 手動速率限制（因為使用 Upstash Redis）
    const clientIP = await getClientIP();
    const rateLimitResult = await rateLimit(
      `child_create:${clientIP}`,
      RATE_LIMIT_CONFIGS.CHILD_CREATE
    );

    if (!rateLimitResult.success) {
      return failure("RATE_LIMITED", "請求過於頻繁，請稍後再試");
    }

    if (!ctx.session?.user) {
      return failure("UNAUTHORIZED", "請先登入");
    }

    const userId = ctx.session.user.id;

    const child = await createChildWithMemberNumber({
      parentId: userId,
      nameChinese: input.nameChinese,
      nameEnglish: input.nameEnglish || null,
      birthYear: input.birthYear ? parseInt(input.birthYear, 10) : null,
      school: input.school || null,
      gender: input.gender || null,
    });

    return success({ message: "學員新增成功", child });
  },
  {
    schema: createChildSchema,
    requireAuth: true,
    audit: true,
    auditAction: "USER_CHILD_CREATE",
    auditResource: "user_child",
  }
);

/**
 * 更新學員資料
 */
export const updateChildAction = createAction<
  UpdateChildInput,
  { message: string; child: { id: string; nameChinese: string; nameEnglish: string | null; birthYear: number | null; school: string | null; gender: string | null } }
>(
  async (input, ctx) => {
    if (!ctx.session?.user) {
      return failure("UNAUTHORIZED", "請先登入");
    }

    const userId = ctx.session.user.id;

    const existingChild = await prisma.userChild.findFirst({
      where: {
        id: input.id,
        parentId: userId,
        deletedAt: null,
      },
    });

    if (!existingChild) {
      return failure("NOT_FOUND", "找不到該學員或無權限修改");
    }

    const updatedChild = await prisma.userChild.update({
      where: { id: input.id },
      data: {
        nameChinese: input.nameChinese,
        nameEnglish: input.nameEnglish || null,
        birthYear: input.birthYear ? parseInt(input.birthYear, 10) : null,
        school: input.school || null,
        gender: input.gender || null,
      },
    });

    return success({ message: "學員資料更新成功", child: updatedChild });
  },
  {
    schema: updateChildSchema,
    requireAuth: true,
    audit: true,
    auditAction: "USER_CHILD_UPDATE",
    auditResource: "user_child",
    auditResourceId: (input) => input.id,
  }
);

/**
 * 刪除學員（軟刪除）
 */
export const deleteChildAction = createAction<
  DeleteChildInput,
  { message: string }
>(
  async (input, ctx) => {
    if (!ctx.session?.user) {
      return failure("UNAUTHORIZED", "請先登入");
    }

    const userId = ctx.session.user.id;

    const existingChild = await prisma.userChild.findFirst({
      where: {
        id: input.id,
        parentId: userId,
        deletedAt: null,
      },
    });

    if (!existingChild) {
      return failure("NOT_FOUND", "找不到該學員或無權限刪除");
    }

    await prisma.userChild.update({
      where: { id: input.id },
      data: { deletedAt: new Date() },
    });

    return success({ message: "學員已刪除" });
  },
  {
    schema: deleteChildSchema,
    requireAuth: true,
    audit: true,
    auditAction: "USER_CHILD_DELETE",
    auditResource: "user_child",
    auditResourceId: (input) => input.id,
  }
);

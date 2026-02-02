"use server";

/**
 * User Actions - Children
 * 學員管理操作
 */

import { prisma } from "@/lib/db";
import { safeAction, success, failure, requireUser } from "@/lib/actions";
import { rateLimit, RATE_LIMIT_CONFIGS } from "@/lib/server";
import { createChildWithMemberNumber } from "@/lib/services";
import { createChildSchema, updateChildSchema, deleteChildSchema } from "../schemas/children";
import { getClientIP } from "./_helpers";

export const createChildAction = safeAction(createChildSchema, async (input) => {
  const clientIP = await getClientIP();
  const rateLimitResult = await rateLimit(
    `child_create:${clientIP}`,
    RATE_LIMIT_CONFIGS.CHILD_CREATE
  );

  if (!rateLimitResult.success) {
    return failure("RATE_LIMITED", "請求過於頻繁，請稍後再試");
  }

  const auth = await requireUser();
  if (!auth.ok) return auth;

  const userId = auth.data.id;

  const child = await createChildWithMemberNumber({
    parentId: userId,
    nameChinese: input.nameChinese,
    nameEnglish: input.nameEnglish || null,
    birthYear: input.birthYear ? parseInt(input.birthYear, 10) : null,
    school: input.school || null,
    gender: input.gender || null,
  });

  return success({ message: "學員新增成功", child });
});

export const updateChildAction = safeAction(updateChildSchema, async (input) => {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const userId = auth.data.id;

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
});

export const deleteChildAction = safeAction(deleteChildSchema, async (input) => {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const userId = auth.data.id;

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
});

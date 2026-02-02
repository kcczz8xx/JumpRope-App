"use server";

/**
 * User Actions - Bank
 * 用戶收款資料操作
 *
 * 使用 createAction wrapper 自動處理：
 * - Schema 驗證
 * - 認證檢查
 * - 審計日誌
 * - 錯誤處理
 */

import { prisma } from "@/lib/db";
import type { UserBankAccount } from "@prisma/client";
import { createAction, success, failure } from "@/lib/patterns";
import { updateBankSchema, type UpdateBankInput } from "../schemas/bank";

/**
 * 更新用戶收款資料
 */
export const updateBankAction = createAction<
  UpdateBankInput,
  { message: string; bankAccount: UserBankAccount }
>(
  async (input, ctx) => {
    if (!ctx.session?.user) {
      return failure("UNAUTHORIZED", "請先登入");
    }

    const userId = ctx.session.user.id;
    const { bankName, accountNumber, accountHolderName, fpsId, fpsEnabled, notes } =
      input;

    const updatedBankAccount = await prisma.userBankAccount.upsert({
      where: { userId },
      update: {
        bankName,
        accountNumber,
        accountHolderName,
        fpsId: fpsId || null,
        fpsEnabled: fpsEnabled || false,
        notes: notes || null,
      },
      create: {
        userId,
        bankName,
        accountNumber,
        accountHolderName,
        fpsId: fpsId || null,
        fpsEnabled: fpsEnabled || false,
        notes: notes || null,
      },
    });

    return success({ message: "收款資料更新成功", bankAccount: updatedBankAccount });
  },
  {
    schema: updateBankSchema,
    requireAuth: true,
    audit: true,
    auditAction: "USER_BANK_UPDATE",
    auditResource: "user_bank",
  }
);

/**
 * 刪除用戶收款資料
 */
export const deleteBankAction = createAction<void, { message: string }>(
  async (_, ctx) => {
    if (!ctx.session?.user) {
      return failure("UNAUTHORIZED", "請先登入");
    }

    const userId = ctx.session.user.id;

    const existingAccount = await prisma.userBankAccount.findUnique({
      where: { userId },
    });

    if (!existingAccount) {
      return failure("NOT_FOUND", "沒有收款資料可刪除");
    }

    await prisma.userBankAccount.delete({
      where: { userId },
    });

    return success({ message: "收款資料已刪除" });
  },
  {
    requireAuth: true,
    audit: true,
    auditAction: "USER_BANK_DELETE",
    auditResource: "user_bank",
  }
);

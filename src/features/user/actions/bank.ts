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
import { createAction, success } from "@/lib/patterns";
import { failureFromCode } from "@/features/_core/error-codes";
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
      return failureFromCode("PERMISSION", "UNAUTHORIZED");
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
      return failureFromCode("PERMISSION", "UNAUTHORIZED");
    }

    const userId = ctx.session.user.id;

    const existingAccount = await prisma.userBankAccount.findUnique({
      where: { userId },
    });

    if (!existingAccount) {
      return failureFromCode("RESOURCE", "NOT_FOUND");
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

"use server";

/**
 * User Actions - Bank
 * 用戶收款資料操作
 */

import { prisma } from "@/lib/db";
import { safeAction, success, failure, requireUser } from "@/lib/actions";
import { updateBankSchema } from "../schemas/bank";

export const updateBankAction = safeAction(updateBankSchema, async (input) => {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const userId = auth.data.id;
  const { bankName, accountNumber, accountHolderName, fpsId, fpsEnabled, notes } = input;

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
});

export async function deleteBankAction() {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const userId = auth.data.id;

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
}

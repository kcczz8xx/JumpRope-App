/**
 * User Queries - Bank
 * 用戶收款資料查詢
 */

import { prisma } from "@/lib/db";
import { requireUser, success, type ActionResult } from "@/lib/actions";

export async function getBankAccount(): Promise<
  ActionResult<{
    id: string;
    bankName: string | null;
    accountNumber: string | null;
    accountHolderName: string | null;
    fpsId: string | null;
    fpsEnabled: boolean;
    notes: string | null;
  } | null>
> {
  const auth = await requireUser();
  if (!auth.success) return auth;

  const bankAccount = await prisma.userBankAccount.findUnique({
    where: { userId: auth.data.id },
    select: {
      id: true,
      bankName: true,
      accountNumber: true,
      accountHolderName: true,
      fpsId: true,
      fpsEnabled: true,
      notes: true,
    },
  });

  return success(bankAccount);
}

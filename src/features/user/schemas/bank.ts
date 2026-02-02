/**
 * User Schemas - Bank
 * 用戶收款資料驗證規則
 */

import { z } from "zod";

export const updateBankSchema = z.object({
  bankName: z.string().min(1, "請選擇銀行"),
  accountNumber: z
    .string()
    .min(1, "請輸入戶口號碼")
    .max(30, "戶口號碼不能超過 30 字元"),
  accountHolderName: z
    .string()
    .min(1, "請輸入戶口持有人姓名")
    .max(100, "姓名不能超過 100 字元"),
  fpsId: z.string().max(50, "轉數快 ID 不能超過 50 字元").optional(),
  fpsEnabled: z.boolean().optional(),
  notes: z.string().max(500, "備註不能超過 500 字元").optional(),
});

export type UpdateBankInput = z.infer<typeof updateBankSchema>;

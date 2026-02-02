/**
 * User Schemas - Profile
 * 用戶個人資料驗證規則
 */

import { z } from "zod";

export const updateProfileSchema = z.object({
  nickname: z.string().max(50, "暱稱不能超過 50 字元").optional(),
  email: z.string().email("請輸入有效的電郵地址").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^\+?[0-9]{8,15}$/, "請輸入有效的電話號碼")
    .optional(),
  whatsappEnabled: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

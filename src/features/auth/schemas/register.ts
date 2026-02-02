/**
 * Auth Schemas - 用戶註冊
 */

import { z } from "zod";

export const registerSchema = z.object({
  phone: z.string().min(8, "請輸入有效的電話號碼"),
  email: z.string().email("請輸入有效的電郵地址"),
  password: z
    .string()
    .min(8, "密碼至少需要 8 個字元")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "密碼需包含大小寫字母及數字"),
  nickname: z.string().min(1, "請輸入暱稱"),
  title: z.string().min(1, "請選擇稱謂"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

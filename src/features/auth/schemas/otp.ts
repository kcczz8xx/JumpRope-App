/**
 * Auth Schemas - OTP 相關
 */

import { z } from "zod";

const OTP_PURPOSES = ["register", "reset-password", "update-contact"] as const;

export const sendOtpSchema = z.object({
  phone: z.string().min(8, "請輸入有效的電話號碼"),
  email: z.string().email("請輸入有效的電郵地址").optional(),
  purpose: z.enum(OTP_PURPOSES, { message: "無效的驗證用途" }),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(8, "請輸入有效的電話號碼"),
  code: z.string().length(6, "驗證碼必須是 6 位數字"),
  purpose: z.enum(OTP_PURPOSES, { message: "無效的驗證用途" }),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

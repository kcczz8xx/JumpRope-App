/**
 * Auth Feature - Zod Schemas
 * 驗證規則定義
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

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "請輸入現有密碼"),
  newPassword: z
    .string()
    .min(8, "新密碼至少需要 8 個字元")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "密碼需包含大小寫字母及數字"),
});

export const resetPasswordSendSchema = z.object({
  phone: z.string().min(8, "請輸入有效的電話號碼").optional(),
  email: z.string().email("請輸入有效的電郵地址").optional(),
}).refine((data) => data.phone || data.email, {
  message: "請提供電話號碼或電郵地址",
});

export const resetPasswordVerifySchema = z.object({
  phone: z.string().min(8, "請輸入有效的電話號碼"),
  code: z.string().length(6, "驗證碼必須是 6 位數字"),
});

export const resetPasswordSchema = z.object({
  phone: z.string().min(8, "請輸入有效的電話號碼"),
  password: z
    .string()
    .min(8, "密碼至少需要 8 個字元")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "密碼需包含大小寫字母及數字"),
  resetToken: z.string().min(1, "請提供重設令牌"),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ResetPasswordSendInput = z.infer<typeof resetPasswordSendSchema>;
export type ResetPasswordVerifyInput = z.infer<typeof resetPasswordVerifySchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

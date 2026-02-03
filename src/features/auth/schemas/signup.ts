/**
 * Auth Schemas - Sign Up
 */

import { z } from "zod";
import {
  phoneSchema,
  emailSchema,
  passwordSchema,
  nicknameSchema,
  titleSchema,
  otpSchema,
} from "./common";

/**
 * 註冊表單 Schema（Step 1: 填寫資料）
 */
export const signUpFormSchema = z
  .object({
    title: titleSchema,
    nickname: nicknameSchema,
    phone: phoneSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "請確認密碼"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "兩次輸入的密碼不一致",
    path: ["confirmPassword"],
  });

export type SignUpFormInput = z.infer<typeof signUpFormSchema>;

/**
 * OTP 驗證 Schema（Step 2: 電話驗證）
 */
export const signUpOtpSchema = z.object({
  phone: phoneSchema,
  code: otpSchema,
});

export type SignUpOtpInput = z.infer<typeof signUpOtpSchema>;

/**
 * 註冊完成 Schema（發送到 Server Action）
 */
export const signUpCompleteSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
  email: emailSchema,
  nickname: nicknameSchema,
  title: titleSchema,
});

export type SignUpCompleteInput = z.infer<typeof signUpCompleteSchema>;

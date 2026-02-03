/**
 * Auth Schemas - Reset Password
 */

import { z } from "zod";
import { phoneSchema, emailSchema, passwordSchema, otpSchema } from "./common";

/**
 * 重設方式
 */
export const resetMethodSchema = z.enum(["phone", "email"]);
export type ResetMethod = z.infer<typeof resetMethodSchema>;

/**
 * 發送驗證碼 Schema（Step 1）
 */
export const resetPasswordRequestSchema = z
  .object({
    method: resetMethodSchema,
    phone: z.string().optional(),
    email: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.method === "phone") {
      if (!data.phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "請輸入電話號碼",
          path: ["phone"],
        });
        return;
      }
      const result = phoneSchema.safeParse(data.phone);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.error.issues[0]?.message || "電話號碼格式錯誤",
          path: ["phone"],
        });
      }
    } else if (data.method === "email") {
      if (!data.email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "請輸入電郵地址",
          path: ["email"],
        });
        return;
      }
      const result = emailSchema.safeParse(data.email);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.error.issues[0]?.message || "電郵格式錯誤",
          path: ["email"],
        });
      }
    }
  });

export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>;

/**
 * 驗證 OTP Schema（Step 2）
 */
export const resetPasswordOtpSchema = z.object({
  phone: phoneSchema,
  code: otpSchema,
});

export type ResetPasswordOtpInput = z.infer<typeof resetPasswordOtpSchema>;

/**
 * 設定新密碼 Schema（Step 3）
 */
export const resetPasswordNewSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "請確認密碼"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "兩次輸入的密碼不一致",
    path: ["confirmPassword"],
  });

export type ResetPasswordNewInput = z.infer<typeof resetPasswordNewSchema>;

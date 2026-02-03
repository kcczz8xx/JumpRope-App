/**
 * Auth Schemas - Sign In
 */

import { z } from "zod";
import { phoneSchema, memberNumberSchema, passwordSchema } from "./common";

/**
 * 登入方式
 */
export const loginMethodSchema = z.enum(["phone", "memberNumber"]);
export type LoginMethod = z.infer<typeof loginMethodSchema>;

/**
 * 登入表單 Schema
 *
 * 支援兩種登入方式：
 * 1. 電話號碼 + 密碼
 * 2. 會員編號 + 密碼
 */
export const signInSchema = z
  .object({
    loginMethod: loginMethodSchema,
    identifier: z.string().min(1, "請輸入電話號碼或會員編號"),
    password: passwordSchema,
    rememberMe: z.boolean(),
  })
  .superRefine((data, ctx) => {
    // 根據登入方式驗證 identifier 格式
    if (data.loginMethod === "phone") {
      const result = phoneSchema.safeParse(data.identifier);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.error.issues[0]?.message || "電話號碼格式錯誤",
          path: ["identifier"],
        });
      }
    } else if (data.loginMethod === "memberNumber") {
      const result = memberNumberSchema.safeParse(data.identifier);
      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: result.error.issues[0]?.message || "會員編號格式錯誤",
          path: ["identifier"],
        });
      }
    }
  });

export type SignInInput = z.infer<typeof signInSchema>;

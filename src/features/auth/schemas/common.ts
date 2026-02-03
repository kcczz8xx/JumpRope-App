/**
 * Auth Schemas - Common
 *
 * 共用的驗證 schema，可在多個表單中複用
 */

import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

/**
 * 電話號碼驗證
 * - 使用 libphonenumber-js 驗證格式
 */
export const phoneSchema = z
  .string()
  .min(1, "請輸入電話號碼")
  .refine((val) => isValidPhoneNumber(val), "請輸入有效的電話號碼格式");

/**
 * 密碼驗證
 * - 至少 8 個字元
 */
export const passwordSchema = z
  .string()
  .min(1, "請輸入密碼")
  .min(8, "密碼至少需要 8 個字元");

/**
 * 電郵驗證
 */
export const emailSchema = z
  .string()
  .min(1, "請輸入電郵地址")
  .email("請輸入有效的電郵格式");

/**
 * 會員編號驗證
 * - 格式：M + 5位數字（如 M00001）
 */
export const memberNumberSchema = z
  .string()
  .min(1, "請輸入會員編號")
  .regex(/^M\d{5}$/, "會員編號格式不正確（例：M00001）");

/**
 * OTP 驗證碼
 * - 6 位數字
 */
export const otpSchema = z
  .string()
  .length(6, "請輸入 6 位驗證碼")
  .regex(/^\d{6}$/, "驗證碼必須為 6 位數字");

/**
 * 暱稱驗證
 */
export const nicknameSchema = z
  .string()
  .min(1, "請輸入暱稱")
  .max(50, "暱稱不能超過 50 個字元");

/**
 * 稱呼驗證
 */
export const titleSchema = z.enum(["先生", "女士", "小姐", "太太"], {
  message: "請選擇稱呼",
});

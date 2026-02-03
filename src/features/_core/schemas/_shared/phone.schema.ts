import { z } from "zod";

/**
 * 香港電話號碼格式驗證
 *
 * 支援格式：
 * - 8 位數字：12345678
 * - 帶空格：1234 5678
 * - 帶連字號：1234-5678
 * - 帶國碼：+852 12345678
 */
const HK_PHONE_REGEX = /^(\+852\s?)?[2-9]\d{3}[\s-]?\d{4}$/;

/**
 * 國際電話號碼格式驗證（寬鬆）
 *
 * 支援格式：
 * - +國碼 號碼
 * - 8-15 位數字
 */
const INTL_PHONE_REGEX = /^\+?[\d\s-]{8,15}$/;

/** 電話號碼 Schema（香港格式，必填） */
export const phoneSchema = z
  .string()
  .min(1, "請輸入電話號碼")
  .regex(HK_PHONE_REGEX, "請輸入有效的香港電話號碼");

/** 電話號碼 Schema（香港格式，可選） */
export const phoneOptionalSchema = z
  .string()
  .regex(HK_PHONE_REGEX, "請輸入有效的香港電話號碼")
  .optional()
  .or(z.literal(""));

/** 電話號碼 Schema（國際格式，必填） */
export const phoneInternationalSchema = z
  .string()
  .min(1, "請輸入電話號碼")
  .regex(INTL_PHONE_REGEX, "請輸入有效的電話號碼");

/** 電話號碼 Schema（國際格式，可選） */
export const phoneInternationalOptionalSchema = z
  .string()
  .regex(INTL_PHONE_REGEX, "請輸入有效的電話號碼")
  .optional()
  .or(z.literal(""));

/** 電話號碼類型 */
export type Phone = z.infer<typeof phoneSchema>;

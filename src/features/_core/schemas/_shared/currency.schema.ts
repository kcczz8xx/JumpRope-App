import { z } from "zod";

/** 金額正則（支援整數和小數） */
const CURRENCY_REGEX = /^\d+(\.\d{1,2})?$/;

/** 金額 Schema（必填，字串格式） */
export const currencySchema = z
  .string()
  .min(1, "請輸入金額")
  .regex(CURRENCY_REGEX, "請輸入有效的金額格式");

/** 金額 Schema（可選，字串格式） */
export const currencyOptionalSchema = z
  .string()
  .regex(CURRENCY_REGEX, "請輸入有效的金額格式")
  .optional()
  .or(z.literal(""));

/** 金額 Schema（必填，數字格式） */
export const currencyNumberSchema = z
  .number()
  .min(0, "金額不能為負數")
  .multipleOf(0.01, "金額最多只能有 2 位小數");

/** 金額 Schema（可選，數字格式） */
export const currencyNumberOptionalSchema = z
  .number()
  .min(0, "金額不能為負數")
  .multipleOf(0.01, "金額最多只能有 2 位小數")
  .optional()
  .nullable();

/** 金額類型 */
export type Currency = z.infer<typeof currencySchema>;
export type CurrencyNumber = z.infer<typeof currencyNumberSchema>;

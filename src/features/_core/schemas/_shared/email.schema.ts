import { z } from "zod";

/** 電郵地址 Schema（必填） */
export const emailSchema = z
  .string()
  .min(1, "請輸入電郵地址")
  .email("請輸入有效的電郵地址");

/** 電郵地址 Schema（可選） */
export const emailOptionalSchema = z
  .string()
  .email("請輸入有效的電郵地址")
  .optional()
  .or(z.literal(""));

/** 電郵地址類型 */
export type Email = z.infer<typeof emailSchema>;

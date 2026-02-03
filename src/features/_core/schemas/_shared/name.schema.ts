import { z } from "zod";

/** 中文字符正則（包含常用漢字） */
const CHINESE_REGEX = /^[\u4e00-\u9fff\u3400-\u4dbf]+$/;

/** 英文字符正則（包含空格、連字號、撇號） */
const ENGLISH_NAME_REGEX = /^[a-zA-Z][a-zA-Z\s'-]*[a-zA-Z]$/;

/** 中文姓名 Schema（必填） */
export const chineseNameSchema = z
  .string()
  .min(1, "請輸入中文姓名")
  .min(2, "姓名至少需要 2 個字")
  .max(10, "姓名不能超過 10 個字")
  .regex(CHINESE_REGEX, "請只輸入中文字符");

/** 中文姓名 Schema（可選） */
export const chineseNameOptionalSchema = z
  .string()
  .min(2, "姓名至少需要 2 個字")
  .max(10, "姓名不能超過 10 個字")
  .regex(CHINESE_REGEX, "請只輸入中文字符")
  .optional()
  .or(z.literal(""));

/** 英文姓名 Schema（必填） */
export const englishNameSchema = z
  .string()
  .min(1, "請輸入英文姓名")
  .min(2, "姓名至少需要 2 個字母")
  .max(50, "姓名不能超過 50 個字母")
  .regex(ENGLISH_NAME_REGEX, "請只輸入英文字母");

/** 英文姓名 Schema（可選） */
export const englishNameOptionalSchema = z
  .string()
  .min(2, "姓名至少需要 2 個字母")
  .max(50, "姓名不能超過 50 個字母")
  .regex(ENGLISH_NAME_REGEX, "請只輸入英文字母")
  .optional()
  .or(z.literal(""));

/** 通用姓名 Schema（中英文皆可，必填） */
export const nameSchema = z
  .string()
  .min(1, "請輸入姓名")
  .min(2, "姓名至少需要 2 個字")
  .max(50, "姓名不能超過 50 個字");

/** 通用姓名 Schema（中英文皆可，可選） */
export const nameOptionalSchema = z
  .string()
  .min(2, "姓名至少需要 2 個字")
  .max(50, "姓名不能超過 50 個字")
  .optional()
  .or(z.literal(""));

/** 姓名類型 */
export type ChineseName = z.infer<typeof chineseNameSchema>;
export type EnglishName = z.infer<typeof englishNameSchema>;
export type Name = z.infer<typeof nameSchema>;

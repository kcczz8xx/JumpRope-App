import { z } from "zod";

/** ISO 日期格式正則（YYYY-MM-DD） */
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** 時間格式正則（HH:mm） */
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** 日期 Schema（必填，字串格式 YYYY-MM-DD） */
export const dateSchema = z
  .string()
  .min(1, "請選擇日期")
  .regex(ISO_DATE_REGEX, "日期格式錯誤")
  .refine((val) => !isNaN(Date.parse(val)), "無效的日期");

/** 日期 Schema（可選） */
export const dateOptionalSchema = z
  .string()
  .regex(ISO_DATE_REGEX, "日期格式錯誤")
  .refine((val) => !isNaN(Date.parse(val)), "無效的日期")
  .optional()
  .nullable()
  .or(z.literal(""));

/** 時間 Schema（必填，格式 HH:mm） */
export const timeSchema = z
  .string()
  .min(1, "請選擇時間")
  .regex(TIME_REGEX, "時間格式錯誤（HH:mm）");

/** 時間 Schema（可選） */
export const timeOptionalSchema = z
  .string()
  .regex(TIME_REGEX, "時間格式錯誤（HH:mm）")
  .optional()
  .nullable()
  .or(z.literal(""));

/** 日期範圍 Schema */
export const dateRangeSchema = z
  .object({
    startDate: dateSchema,
    endDate: dateSchema,
  })
  .refine(
    (data) => new Date(data.startDate) <= new Date(data.endDate),
    "結束日期必須在開始日期之後"
  );

/** 時間範圍 Schema */
export const timeRangeSchema = z
  .object({
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .refine(
    (data) => data.startTime < data.endTime,
    "結束時間必須在開始時間之後"
  );

/** 學年格式 Schema（YYYY-YYYY，如 2024-2025） */
export const academicYearSchema = z
  .string()
  .min(1, "請選擇學年")
  .regex(/^\d{4}-\d{4}$/, "學年格式錯誤（如：2024-2025）")
  .refine((val) => {
    const [start, end] = val.split("-").map(Number);
    return end === start + 1;
  }, "學年結束年份必須是開始年份的下一年");

/** 類型定義 */
export type DateString = z.infer<typeof dateSchema>;
export type TimeString = z.infer<typeof timeSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type TimeRange = z.infer<typeof timeRangeSchema>;
export type AcademicYear = z.infer<typeof academicYearSchema>;

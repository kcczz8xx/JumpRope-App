/**
 * School Service Schemas - 共用 Schema
 * 可重用於多個表單的基礎驗證規則
 * 
 * ⚠️ 這是型別的 Single Source of Truth
 * components/types.ts 應從此處導入，而非重複定義
 */

import { z } from "zod";

// ===== Enums（運行時可用）=====

export enum CourseTerm {
  FULL_YEAR = "FULL_YEAR",
  FIRST_TERM = "FIRST_TERM",
  SECOND_TERM = "SECOND_TERM",
  SUMMER = "SUMMER",
}

export enum ChargingModel {
  STUDENT_PER_LESSON = "STUDENT_PER_LESSON",
  TUTOR_PER_LESSON = "TUTOR_PER_LESSON",
  STUDENT_HOURLY = "STUDENT_HOURLY",
  TUTOR_HOURLY = "TUTOR_HOURLY",
  STUDENT_FULL_COURSE = "STUDENT_FULL_COURSE",
  TEAM_ACTIVITY = "TEAM_ACTIVITY",
}

export enum CourseStatus {
  DRAFT = "DRAFT",
  SCHEDULED = "SCHEDULED",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  SUSPENDED = "SUSPENDED",
}

export enum SalaryCalculationMode {
  PER_LESSON = "PER_LESSON",
  HOURLY = "HOURLY",
  MONTHLY_FIXED = "MONTHLY_FIXED",
}

export enum LessonType {
  REGULAR = "REGULAR",
  MAKEUP = "MAKEUP",
  EXTRA_PRACTICE = "EXTRA_PRACTICE",
}

export enum LessonStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  POSTPONED = "POSTPONED",
}

// ===== 基礎欄位 Schema =====

export const requiredStringSchema = (fieldName: string) =>
  z.string().min(1, `請輸入${fieldName}`);

export const optionalStringSchema = z.string().optional().or(z.literal(""));

export const optionalEmailSchema = z
  .string()
  .email("請輸入有效的電郵地址")
  .optional()
  .or(z.literal(""));

export const optionalUrlSchema = z
  .string()
  .url("請輸入有效的網址")
  .optional()
  .or(z.literal(""));

export const positiveNumberSchema = z
  .number()
  .positive("請輸入有效的金額")
  .nullable()
  .optional();

export const positiveIntSchema = z
  .number()
  .int()
  .positive("請輸入有效的數字")
  .nullable()
  .optional();

// ===== 日期驗證 =====

export const dateStringSchema = z.string().nullable().optional();

export const dateRangeSchema = z
  .object({
    startDate: dateStringSchema,
    endDate: dateStringSchema,
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: "結束日期不能早於開始日期",
      path: ["endDate"],
    }
  );

// ===== 課程相關常數（供 Zod schema 使用）=====

export const COURSE_TERMS = [
  "FULL_YEAR",
  "FIRST_TERM",
  "SECOND_TERM",
  "SUMMER",
] as const;

export const CHARGING_MODELS = [
  "STUDENT_PER_LESSON",
  "TUTOR_PER_LESSON",
  "STUDENT_HOURLY",
  "TUTOR_HOURLY",
  "STUDENT_FULL_COURSE",
  "TEAM_ACTIVITY",
] as const;

export const COURSE_STATUSES = [
  "DRAFT",
  "SCHEDULED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
  "SUSPENDED",
] as const;

export const LESSON_TYPES = [
  "REGULAR",
  "MAKEUP",
  "EXTRA_PRACTICE",
] as const;

export const LESSON_STATUSES = [
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "POSTPONED",
] as const;

// ===== Zod infer types（向後兼容）=====

export type CourseTermType = (typeof COURSE_TERMS)[number];
export type ChargingModelType = (typeof CHARGING_MODELS)[number];
export type CourseStatusType = (typeof COURSE_STATUSES)[number];
export type LessonTypeType = (typeof LESSON_TYPES)[number];
export type LessonStatusType = (typeof LESSON_STATUSES)[number];

// ===== 課程類型常數 =====

export type CourseType = string;

export const DEFAULT_COURSE_TYPES = [
  "興趣班",
  "表演班",
  "校隊班",
  "暑期班",
  "推廣活動",
] as const;

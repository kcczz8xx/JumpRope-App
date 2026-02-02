/**
 * School Service Feature - Zod Schemas
 * 驗證規則定義
 */

import { z } from "zod";

// ============================================
// School Schemas
// ============================================

export const createSchoolSchema = z.object({
  schoolName: z.string().min(1, "請輸入學校名稱").max(200, "學校名稱不能超過 200 字元"),
  schoolNameEn: z.string().max(200, "英文名稱不能超過 200 字元").optional(),
  address: z.string().max(500, "地址不能超過 500 字元").optional(),
  phone: z.string().max(50, "電話號碼不能超過 50 字元").optional(),
  email: z.string().email("請輸入有效的電郵地址").optional().or(z.literal("")),
  website: z.string().url("請輸入有效的網址").optional().or(z.literal("")),
  partnershipStartDate: z.string().optional(),
  partnershipEndDate: z.string().optional().nullable(),
  partnershipStartYear: z.string().optional(),
  confirmationChannel: z.string().optional(),
  remarks: z.string().max(1000, "備註不能超過 1000 字元").optional(),
});

export const updateSchoolSchema = createSchoolSchema.partial().extend({
  id: z.string().min(1, "缺少學校 ID"),
});

// ============================================
// School Contact Schemas
// ============================================

export const schoolContactSchema = z.object({
  nameChinese: z.string().min(1, "請輸入中文姓名").max(100, "姓名不能超過 100 字元"),
  nameEnglish: z.string().max(200, "英文姓名不能超過 200 字元").optional(),
  position: z.string().max(100, "職位不能超過 100 字元").optional(),
  phone: z.string().max(50, "電話號碼不能超過 50 字元").optional(),
  mobile: z.string().max(50, "手機號碼不能超過 50 字元").optional(),
  email: z.string().email("請輸入有效的電郵地址").optional().or(z.literal("")),
  isPrimary: z.boolean().optional(),
});

// ============================================
// Course Schemas
// ============================================

const COURSE_TERMS = ["FULL_YEAR", "FIRST_TERM", "SECOND_TERM", "SUMMER"] as const;
const CHARGING_MODELS = [
  "STUDENT_PER_LESSON",
  "TUTOR_PER_LESSON",
  "STUDENT_HOURLY",
  "TUTOR_HOURLY",
  "STUDENT_FULL_COURSE",
  "TEAM_ACTIVITY",
] as const;

export const createCourseSchema = z.object({
  schoolId: z.string().min(1, "請選擇學校"),
  courseName: z.string().min(1, "請輸入課程名稱").max(200, "課程名稱不能超過 200 字元"),
  courseType: z.string().optional(),
  courseTerm: z.enum(COURSE_TERMS).optional(),
  academicYear: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  requiredTutors: z.number().int().min(1).optional(),
  maxStudents: z.number().int().min(1).optional().nullable(),
  courseDescription: z.string().max(2000, "描述不能超過 2000 字元").optional(),
  chargingModel: z.enum(CHARGING_MODELS).optional(),
  studentPerLessonFee: z.number().optional().nullable(),
  fixedPerLessonFee: z.number().optional().nullable(),
  studentPerMonthFee: z.number().optional().nullable(),
  fixedPerMonthFee: z.number().optional().nullable(),
  totalCourseFee: z.number().optional().nullable(),
  tutorSalaryCalculationMode: z.string().optional(),
  tutorPerLessonFee: z.number().optional().nullable(),
  tutorPerMonthFee: z.number().optional().nullable(),
  tutorTotalCourseFee: z.number().optional().nullable(),
});

export const updateCourseSchema = createCourseSchema.partial().extend({
  id: z.string().min(1, "缺少課程 ID"),
});

// ============================================
// Batch Creation Schema
// ============================================

const batchCourseSchema = z.object({
  courseName: z.string().min(1, "請輸入課程名稱"),
  courseType: z.string().optional(),
  courseTerm: z.enum(COURSE_TERMS).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  requiredTutors: z.number().int().min(1).optional(),
  maxStudents: z.number().int().min(1).optional().nullable(),
  courseDescription: z.string().optional(),
  chargingModel: z.array(z.enum(CHARGING_MODELS)).optional(),
  studentPerLessonFee: z.number().optional().nullable(),
  studentHourlyFee: z.number().optional().nullable(),
  studentFullCourseFee: z.number().optional().nullable(),
  teamActivityFee: z.number().optional().nullable(),
  tutorPerLessonFee: z.number().optional().nullable(),
  tutorHourlyFee: z.number().optional().nullable(),
});

export const batchCreateWithSchoolSchema = z.object({
  school: createSchoolSchema,
  contact: schoolContactSchema,
  academicYear: z.string().optional(),
  courses: z.array(batchCourseSchema).min(1, "請至少新增一個課程"),
});

// ============================================
// Types
// ============================================

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;
export type SchoolContactInput = z.infer<typeof schoolContactSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type BatchCreateWithSchoolInput = z.infer<typeof batchCreateWithSchoolSchema>;

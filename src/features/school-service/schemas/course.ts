/**
 * School Service Schemas - 課程相關
 */

import { z } from "zod";
import { COURSE_TERMS, CHARGING_MODELS } from "./common";

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

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

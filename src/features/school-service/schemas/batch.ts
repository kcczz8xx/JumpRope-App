/**
 * School Service Schemas - 批量建立
 */

import { z } from "zod";
import { createSchoolSchema } from "./school";
import { schoolContactSchema } from "./contact";
import { COURSE_TERMS, CHARGING_MODELS } from "./course";

const batchCourseSchema = z.object({
  courseName: z.string().min(1, "請輸入課程名稱"),
  courseType: z.string().optional(),
  courseTerm: z.enum(COURSE_TERMS).optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  requiredTutors: z.number().int().min(1).optional(),
  maxStudents: z.number().int().min(1).optional().nullable(),
  courseDescription: z.string().optional().nullable(),
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

export type BatchCreateWithSchoolInput = z.infer<typeof batchCreateWithSchoolSchema>;

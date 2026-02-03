/**
 * School Service Schemas - 新增課程表單
 * 用於 NewCourseForm 多步驟表單驗證
 */

import { z } from "zod";
import {
  requiredStringSchema,
  optionalStringSchema,
  optionalEmailSchema,
  optionalUrlSchema,
  positiveNumberSchema,
  COURSE_TERMS,
  CHARGING_MODELS,
} from "./common";

// ===== Step 1: 學校資訊 =====

export const newCourseSchoolSchema = z
  .object({
    schoolId: z.string().optional(),
    schoolName: requiredStringSchema("學校名稱"),
    schoolNameEn: optionalStringSchema,
    address: requiredStringSchema("學校地址"),
    phone: optionalStringSchema,
    email: optionalEmailSchema,
    website: optionalUrlSchema,
    partnershipStartDate: requiredStringSchema("合作開始日期"),
    partnershipEndDate: z.string().nullable().optional(),
    partnershipStartYear: z.string().optional(),
    confirmationChannel: requiredStringSchema("確認渠道"),
    remarks: optionalStringSchema,
  })
  .refine(
    (data) => {
      if (data.partnershipStartDate && data.partnershipEndDate) {
        return data.partnershipEndDate >= data.partnershipStartDate;
      }
      return true;
    },
    {
      message: "結束日期不能早於開始日期",
      path: ["partnershipEndDate"],
    }
  );

export const newCourseContactSchema = z.object({
  nameChinese: requiredStringSchema("聯絡人姓名"),
  nameEnglish: optionalStringSchema,
  position: optionalStringSchema,
  phone: optionalStringSchema,
  mobile: optionalStringSchema,
  email: optionalEmailSchema,
  isPrimary: z.boolean().optional(),
});

export const newCourseStep1Schema = z.object({
  school: newCourseSchoolSchema,
  contact: newCourseContactSchema,
});

// ===== Step 2: 課程資訊 =====

const chargingModelSchema = z.array(z.enum(CHARGING_MODELS)).min(1, "請選擇至少一個收費模式");

export const newCourseCourseItemSchema = z
  .object({
    id: z.string(),
    courseName: requiredStringSchema("課程名稱"),
    courseType: requiredStringSchema("課程類型"),
    courseTerm: z.enum(COURSE_TERMS).default("FULL_YEAR"),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    requiredTutors: z.number().int().min(1, "至少需要 1 位導師").default(1),
    maxStudents: z.number().int().min(1).nullable().optional(),
    courseDescription: z.string().nullable().optional(),
    chargingModel: chargingModelSchema,
    studentPerLessonFee: positiveNumberSchema,
    studentHourlyFee: positiveNumberSchema,
    studentFullCourseFee: positiveNumberSchema,
    teamActivityFee: positiveNumberSchema,
    tutorPerLessonFee: positiveNumberSchema,
    tutorHourlyFee: positiveNumberSchema,
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
  )
  .superRefine((data, ctx) => {
    // 根據選擇的收費模式驗證對應金額欄位
    const models = data.chargingModel || [];

    if (models.includes("STUDENT_PER_LESSON") && (!data.studentPerLessonFee || data.studentPerLessonFee <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "請輸入有效的收費金額",
        path: ["studentPerLessonFee"],
      });
    }
    if (models.includes("TUTOR_PER_LESSON") && (!data.tutorPerLessonFee || data.tutorPerLessonFee <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "請輸入有效的收費金額",
        path: ["tutorPerLessonFee"],
      });
    }
    if (models.includes("STUDENT_HOURLY") && (!data.studentHourlyFee || data.studentHourlyFee <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "請輸入有效的收費金額",
        path: ["studentHourlyFee"],
      });
    }
    if (models.includes("TUTOR_HOURLY") && (!data.tutorHourlyFee || data.tutorHourlyFee <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "請輸入有效的收費金額",
        path: ["tutorHourlyFee"],
      });
    }
    if (models.includes("STUDENT_FULL_COURSE") && (!data.studentFullCourseFee || data.studentFullCourseFee <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "請輸入有效的收費金額",
        path: ["studentFullCourseFee"],
      });
    }
    if (models.includes("TEAM_ACTIVITY") && (!data.teamActivityFee || data.teamActivityFee <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "請輸入有效的收費金額",
        path: ["teamActivityFee"],
      });
    }
  });

export const newCourseStep2Schema = z.object({
  courses: z.array(newCourseCourseItemSchema).min(1, "請至少新增一個課程"),
});

// ===== 完整表單 Schema =====

export const newCourseFormSchema = z.object({
  school: newCourseSchoolSchema,
  contact: newCourseContactSchema,
  academicYear: z.string().optional(),
  courses: z.array(newCourseCourseItemSchema).min(1, "請至少新增一個課程"),
});

// ===== Types =====

export type NewCourseSchoolInput = z.infer<typeof newCourseSchoolSchema>;
export type NewCourseContactInput = z.infer<typeof newCourseContactSchema>;
export type NewCourseCourseItemInput = z.infer<typeof newCourseCourseItemSchema>;
export type NewCourseFormInput = z.infer<typeof newCourseFormSchema>;

/**
 * School Service Schemas - 聯絡人相關
 */

import { z } from "zod";

export const schoolContactSchema = z.object({
  nameChinese: z.string().min(1, "請輸入中文姓名").max(100, "姓名不能超過 100 字元"),
  nameEnglish: z.string().max(200, "英文姓名不能超過 200 字元").optional(),
  position: z.string().max(100, "職位不能超過 100 字元").optional(),
  phone: z.string().max(50, "電話號碼不能超過 50 字元").optional(),
  mobile: z.string().max(50, "手機號碼不能超過 50 字元").optional(),
  email: z.string().email("請輸入有效的電郵地址").optional().or(z.literal("")),
  isPrimary: z.boolean().optional(),
});

export type SchoolContactInput = z.infer<typeof schoolContactSchema>;

/**
 * School Service Schemas - 學校相關
 */

import { z } from "zod";

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

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;

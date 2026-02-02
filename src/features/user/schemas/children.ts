/**
 * User Schemas - Children
 * 學員資料驗證規則
 */

import { z } from "zod";

export const createChildSchema = z.object({
  nameChinese: z.string().min(1, "請輸入學員中文名").max(50, "中文姓名不能超過 50 字元"),
  nameEnglish: z.string().max(100, "英文姓名不能超過 100 字元").optional().or(z.literal("")),
  birthYear: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const parsed = parseInt(val, 10);
        return !isNaN(parsed) && parsed >= 1900 && parsed <= new Date().getFullYear();
      },
      { message: "請輸入有效的出生年份" }
    ),
  school: z.string().max(100, "學校名稱不能超過 100 字元").optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
});

export const updateChildSchema = createChildSchema.extend({
  id: z.string().min(1, "缺少學員 ID"),
});

export const deleteChildSchema = z.object({
  id: z.string().min(1, "缺少學員 ID"),
});

export type CreateChildInput = z.infer<typeof createChildSchema>;
export type UpdateChildInput = z.infer<typeof updateChildSchema>;
export type DeleteChildInput = z.infer<typeof deleteChildSchema>;

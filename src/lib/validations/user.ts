/**
 * User Profile Zod Validation Schemas
 * 前後端共用驗證
 */

import { z } from "zod";

export const userInfoSchema = z.object({
  nickname: z.string().max(50, "暱稱不能超過 50 字元").optional(),
  email: z.string().email("請輸入有效的電郵地址").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^\+?[0-9]{8,15}$/, "請輸入有效的電話號碼")
    .optional()
    .or(z.literal("")),
  whatsappEnabled: z.boolean().optional(),
});

export const userAddressSchema = z.object({
  region: z.string().optional(),
  district: z.string().min(1, "請選擇地區"),
  address: z.string().min(1, "請輸入詳細地址").max(200, "地址不能超過 200 字元"),
});

export const userBankSchema = z.object({
  bankName: z.string().min(1, "請選擇銀行"),
  accountNumber: z
    .string()
    .min(1, "請輸入戶口號碼")
    .max(30, "戶口號碼不能超過 30 字元"),
  accountHolderName: z
    .string()
    .min(1, "請輸入戶口持有人姓名")
    .max(100, "姓名不能超過 100 字元"),
  fpsId: z.string().max(50, "轉數快 ID 不能超過 50 字元").optional(),
  fpsEnabled: z.boolean().optional(),
  notes: z.string().max(500, "備註不能超過 500 字元").optional(),
});

export const userChildSchema = z.object({
  nickname: z.string().min(1, "請輸入暱稱").max(50, "暱稱不能超過 50 字元"),
  nameChinese: z
    .string()
    .max(50, "中文姓名不能超過 50 字元")
    .optional()
    .or(z.literal("")),
  nameEnglish: z
    .string()
    .max(100, "英文姓名不能超過 100 字元")
    .optional()
    .or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  dateOfBirth: z.string().optional(),
  school: z.string().max(100, "學校名稱不能超過 100 字元").optional(),
  grade: z.string().max(20, "年級不能超過 20 字元").optional(),
  medicalNotes: z.string().max(500, "醫療備註不能超過 500 字元").optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "請輸入現有密碼"),
    newPassword: z
      .string()
      .min(8, "新密碼至少需要 8 個字元")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "密碼需包含大小寫字母及數字"
      ),
    confirmPassword: z.string().min(1, "請確認新密碼"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "兩次輸入的密碼不一致",
    path: ["confirmPassword"],
  });

export type UserInfoFormData = z.infer<typeof userInfoSchema>;
export type UserAddressFormData = z.infer<typeof userAddressSchema>;
export type UserBankFormData = z.infer<typeof userBankSchema>;
export type UserChildFormData = z.infer<typeof userChildSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

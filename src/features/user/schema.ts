/**
 * User Feature - Zod Schemas
 * 驗證規則定義
 */

import { z } from "zod";

// ============================================
// Profile Schemas
// ============================================

export const updateProfileSchema = z.object({
  nickname: z.string().max(50, "暱稱不能超過 50 字元").optional(),
  email: z.string().email("請輸入有效的電郵地址").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^\+?[0-9]{8,15}$/, "請輸入有效的電話號碼")
    .optional(),
  whatsappEnabled: z.boolean().optional(),
});

// ============================================
// Address Schemas
// ============================================

export const updateAddressSchema = z.object({
  region: z.string().optional(),
  district: z.string().min(1, "請選擇地區"),
  address: z.string().min(1, "請輸入詳細地址").max(200, "地址不能超過 200 字元"),
});

// ============================================
// Bank Schemas
// ============================================

export const updateBankSchema = z.object({
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

// ============================================
// Child Schemas
// ============================================

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

// ============================================
// Tutor Document Schemas
// ============================================

const DOCUMENT_TYPES = [
  "IDENTITY_DOCUMENT",
  "SEXUAL_CONVICTION_CHECK",
  "BANK_DOCUMENT",
  "ADDRESS_PROOF",
  "FIRST_AID_CERTIFICATE",
  "COACHING_CERTIFICATE",
  "OTHER_CERTIFICATE",
] as const;

export const createTutorDocumentSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPES, { message: "無效的文件類型" }),
  name: z.string().min(1, "請填寫文件名稱"),
  referenceNumber: z.string().optional(),
  certificateType: z.string().optional(),
  issuingBody: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export const updateTutorDocumentSchema = createTutorDocumentSchema.extend({
  documentId: z.string().min(1, "缺少文件 ID"),
});

export const deleteTutorDocumentSchema = z.object({
  documentId: z.string().min(1, "缺少文件 ID"),
});

// ============================================
// Types
// ============================================

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
export type UpdateBankInput = z.infer<typeof updateBankSchema>;
export type CreateChildInput = z.infer<typeof createChildSchema>;
export type UpdateChildInput = z.infer<typeof updateChildSchema>;
export type DeleteChildInput = z.infer<typeof deleteChildSchema>;
export type CreateTutorDocumentInput = z.infer<typeof createTutorDocumentSchema>;
export type UpdateTutorDocumentInput = z.infer<typeof updateTutorDocumentSchema>;
export type DeleteTutorDocumentInput = z.infer<typeof deleteTutorDocumentSchema>;

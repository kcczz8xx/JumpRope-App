/**
 * Tutor Document Zod Validation Schemas
 * 前後端共用驗證
 */

import { z } from "zod";

export const documentTypeEnum = z.enum([
  "IDENTITY_DOCUMENT",
  "SEXUAL_CONVICTION_CHECK",
  "BANK_DOCUMENT",
  "ADDRESS_PROOF",
  "FIRST_AID_CERTIFICATE",
  "COACHING_CERTIFICATE",
  "OTHER_CERTIFICATE",
]);

export const tutorDocumentSchema = z.object({
  documentType: documentTypeEnum,
  name: z.string().min(1, "請輸入文件名稱").max(100, "文件名稱不能超過 100 字元"),
  referenceNumber: z
    .string()
    .max(50, "參考編號不能超過 50 字元")
    .optional()
    .or(z.literal("")),
  certificateType: z
    .string()
    .max(50, "證書類型不能超過 50 字元")
    .optional()
    .or(z.literal("")),
  issuingBody: z
    .string()
    .max(100, "簽發機構不能超過 100 字元")
    .optional()
    .or(z.literal("")),
  issueDate: z.string().optional().or(z.literal("")),
  expiryDate: z.string().nullable().optional(),
  isPermanent: z.boolean().optional(),
  notes: z.string().max(500, "備註不能超過 500 字元").optional().or(z.literal("")),
});

export const tutorDocumentCreateSchema = tutorDocumentSchema.extend({
  file: z.instanceof(File).optional(),
});

export const tutorDocumentUpdateSchema = tutorDocumentSchema.extend({
  id: z.string().min(1),
  file: z.instanceof(File).optional(),
});

export type DocumentType = z.infer<typeof documentTypeEnum>;
export type TutorDocumentFormData = z.infer<typeof tutorDocumentSchema>;
export type TutorDocumentCreateData = z.infer<typeof tutorDocumentCreateSchema>;
export type TutorDocumentUpdateData = z.infer<typeof tutorDocumentUpdateSchema>;

export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
];

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `檔案大小不能超過 ${MAX_FILE_SIZE_MB}MB`,
    };
  }

  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "只接受 PDF、JPG、PNG 格式的檔案",
    };
  }

  return { valid: true };
}

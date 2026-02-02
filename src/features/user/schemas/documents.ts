/**
 * User Schemas - Tutor Documents
 * 導師文件驗證規則
 */

import { z } from "zod";

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

export type CreateTutorDocumentInput = z.infer<typeof createTutorDocumentSchema>;
export type UpdateTutorDocumentInput = z.infer<typeof updateTutorDocumentSchema>;
export type DeleteTutorDocumentInput = z.infer<typeof deleteTutorDocumentSchema>;

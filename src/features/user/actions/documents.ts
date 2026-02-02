"use server";

/**
 * User Actions - Tutor Documents
 * 導師文件管理操作
 */

import { prisma } from "@/lib/db";
import { DocumentType, DocumentStatus } from "@prisma/client";
import { put, del } from "@vercel/blob";
import { success, failure, requireUser } from "@/lib/actions";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

function validateFileType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

function validateFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
}

export async function createTutorDocumentAction(formData: FormData) {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const userId = auth.data.id;

  const documentType = formData.get("documentType") as string;
  const name = formData.get("name") as string;
  const referenceNumber = formData.get("referenceNumber") as string | null;
  const certificateType = formData.get("certificateType") as string | null;
  const issuingBody = formData.get("issuingBody") as string | null;
  const issueDate = formData.get("issueDate") as string | null;
  const expiryDate = formData.get("expiryDate") as string | null;
  const file = formData.get("file") as File | null;

  if (!documentType || !name) {
    return failure("VALIDATION_ERROR", "請填寫文件類型和名稱");
  }

  if (!file) {
    return failure("VALIDATION_ERROR", "請上傳文件");
  }

  if (!validateFileType(file.type)) {
    return failure("VALIDATION_ERROR", "只接受 PDF、JPG 或 PNG 格式的文件");
  }

  if (!validateFileSize(file.size)) {
    return failure("VALIDATION_ERROR", "文件大小不能超過 5MB");
  }

  let tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
  });

  if (!tutorProfile) {
    tutorProfile = await prisma.tutorProfile.create({
      data: { userId },
    });
  }

  const timestamp = Date.now();
  const sanitizedName = sanitizeFileName(file.name);
  const blobPath = `tutor-documents/${userId}/${documentType}/${timestamp}-${sanitizedName}`;

  const blob = await put(blobPath, file, {
    access: "public",
    addRandomSuffix: true,
  });

  const document = await prisma.tutorDocument.create({
    data: {
      tutorProfileId: tutorProfile.id,
      documentType: documentType as DocumentType,
      name,
      status: DocumentStatus.PENDING,
      referenceNumber: referenceNumber || null,
      certificateType: certificateType || null,
      issuingBody: issuingBody || null,
      issueDate: issueDate ? new Date(issueDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      documentUrl: blob.url,
      uploadDate: new Date(),
    },
  });

  return success({ message: "文件上傳成功", document });
}

export async function updateTutorDocumentAction(formData: FormData) {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const userId = auth.data.id;

  const documentId = formData.get("documentId") as string;
  const name = formData.get("name") as string;
  const referenceNumber = formData.get("referenceNumber") as string | null;
  const certificateType = formData.get("certificateType") as string | null;
  const issuingBody = formData.get("issuingBody") as string | null;
  const issueDate = formData.get("issueDate") as string | null;
  const expiryDate = formData.get("expiryDate") as string | null;
  const file = formData.get("file") as File | null;

  if (!documentId) {
    return failure("VALIDATION_ERROR", "缺少文件 ID");
  }

  const existingDocument = await prisma.tutorDocument.findFirst({
    where: {
      id: documentId,
      tutorProfile: { userId },
    },
  });

  if (!existingDocument) {
    return failure("NOT_FOUND", "找不到該文件或無權限修改");
  }

  let documentUrl = existingDocument.documentUrl;

  if (file) {
    if (!validateFileType(file.type)) {
      return failure("VALIDATION_ERROR", "只接受 PDF、JPG 或 PNG 格式的文件");
    }

    if (!validateFileSize(file.size)) {
      return failure("VALIDATION_ERROR", "文件大小不能超過 5MB");
    }

    if (existingDocument.documentUrl) {
      try {
        await del(existingDocument.documentUrl);
      } catch (deleteError) {
        console.warn("Failed to delete old blob:", deleteError);
      }
    }

    const timestamp = Date.now();
    const sanitizedName = sanitizeFileName(file.name);
    const blobPath = `tutor-documents/${userId}/${existingDocument.documentType}/${timestamp}-${sanitizedName}`;

    const blob = await put(blobPath, file, {
      access: "public",
      addRandomSuffix: true,
    });

    documentUrl = blob.url;
  }

  const updatedDocument = await prisma.tutorDocument.update({
    where: { id: documentId },
    data: {
      name: name || existingDocument.name,
      status: DocumentStatus.PENDING,
      referenceNumber: referenceNumber ?? existingDocument.referenceNumber,
      certificateType: certificateType ?? existingDocument.certificateType,
      issuingBody: issuingBody ?? existingDocument.issuingBody,
      issueDate: issueDate ? new Date(issueDate) : existingDocument.issueDate,
      expiryDate: expiryDate === "" ? null : expiryDate ? new Date(expiryDate) : existingDocument.expiryDate,
      documentUrl,
      uploadDate: file ? new Date() : existingDocument.uploadDate,
      reviewedAt: null,
      reviewedBy: null,
      reviewNote: null,
    },
  });

  return success({ message: "文件更新成功", document: updatedDocument });
}

export async function deleteTutorDocumentAction(documentId: string) {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const userId = auth.data.id;

  if (!documentId) {
    return failure("VALIDATION_ERROR", "缺少文件 ID");
  }

  const existingDocument = await prisma.tutorDocument.findFirst({
    where: {
      id: documentId,
      tutorProfile: { userId },
    },
  });

  if (!existingDocument) {
    return failure("NOT_FOUND", "找不到該文件或無權限刪除");
  }

  if (existingDocument.documentUrl) {
    try {
      await del(existingDocument.documentUrl);
    } catch (deleteError) {
      console.warn("Failed to delete blob:", deleteError);
    }
  }

  await prisma.tutorDocument.delete({
    where: { id: documentId },
  });

  return success({ message: "文件已刪除" });
}

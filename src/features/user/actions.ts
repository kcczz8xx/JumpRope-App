"use server";

/**
 * User Feature - Server Actions
 * 用戶相關的伺服器操作
 */

import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { DocumentType, DocumentStatus } from "@prisma/client";
import { put, del } from "@vercel/blob";
import { safeAction, success, failure, requireUser } from "@/lib/actions";
import { rateLimit, RATE_LIMIT_CONFIGS } from "@/lib/server";
import { createChildWithMemberNumber } from "@/lib/services";
import { OTP_CONFIG } from "@/lib/constants/otp";
import {
  updateProfileSchema,
  updateAddressSchema,
  updateBankSchema,
  createChildSchema,
  updateChildSchema,
  deleteChildSchema,
} from "./schema";

// ============================================
// Helpers
// ============================================

async function getClientIP(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIP = headersList.get("x-real-ip");
  if (realIP) return realIP;
  return "unknown";
}

// ============================================
// Profile Actions
// ============================================

export const updateProfileAction = safeAction(updateProfileSchema, async (input) => {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const userId = auth.data.id;
  const { nickname, email, phone, whatsappEnabled } = input;

  const updateData: Record<string, unknown> = {};
  const otpPhonesToDelete: string[] = [];

  const needsContactCheck = (email !== undefined && email) || phone !== undefined;
  const currentUser = needsContactCheck
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, phone: true },
      })
    : null;

  if (nickname !== undefined) {
    updateData.nickname = nickname;
  }

  if (email !== undefined) {
    if (email) {
      if (currentUser?.email !== email) {
        const verifiedOtp = await prisma.otp.findFirst({
          where: {
            phone: currentUser?.phone || "",
            purpose: "UPDATE_CONTACT",
            verified: true,
            expiresAt: { gte: new Date(Date.now() - OTP_CONFIG.UPDATE_CONTACT_VERIFY_WINDOW_MS) },
          },
          orderBy: { createdAt: "desc" },
        });

        if (!verifiedOtp) {
          return failure("FORBIDDEN", "請先完成電郵地址驗證");
        }

        if (currentUser?.phone) {
          otpPhonesToDelete.push(currentUser.phone);
        }
      }

      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId },
        },
      });
      if (existingUser) {
        return failure("CONFLICT", "此電郵地址已被使用");
      }
    }
    updateData.email = email || null;
  }

  if (phone !== undefined) {
    if (!phone) {
      return failure("VALIDATION_ERROR", "電話號碼不能為空");
    }

    if (currentUser?.phone !== phone) {
      const verifiedOtp = await prisma.otp.findFirst({
        where: {
          phone,
          purpose: "UPDATE_CONTACT",
          verified: true,
          expiresAt: { gte: new Date(Date.now() - OTP_CONFIG.UPDATE_CONTACT_VERIFY_WINDOW_MS) },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!verifiedOtp) {
        return failure("FORBIDDEN", "請先完成新電話號碼驗證");
      }

      otpPhonesToDelete.push(phone);
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        phone,
        id: { not: userId },
      },
    });
    if (existingUser) {
      return failure("CONFLICT", "此電話號碼已被使用");
    }
    updateData.phone = phone;
  }

  if (whatsappEnabled !== undefined) {
    updateData.whatsappEnabled = whatsappEnabled;
  }

  if (Object.keys(updateData).length === 0) {
    return failure("VALIDATION_ERROR", "沒有要更新的資料");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      nickname: true,
      email: true,
      phone: true,
      whatsappEnabled: true,
    },
  });

  if (otpPhonesToDelete.length > 0) {
    await prisma.otp.deleteMany({
      where: {
        phone: { in: otpPhonesToDelete },
        purpose: "UPDATE_CONTACT",
        verified: true,
      },
    });
  }

  return success({ message: "資料更新成功", user: updatedUser });
});

// ============================================
// Address Actions
// ============================================

export const updateAddressAction = safeAction(updateAddressSchema, async (input) => {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const userId = auth.data.id;
  const { region, district, address } = input;

  const updatedAddress = await prisma.userAddress.upsert({
    where: { userId },
    update: {
      region: region || null,
      district,
      address,
    },
    create: {
      userId,
      region: region || null,
      district,
      address,
    },
  });

  return success({ message: "地址更新成功", address: updatedAddress });
});

export async function deleteAddressAction() {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const userId = auth.data.id;

  const existingAddress = await prisma.userAddress.findUnique({
    where: { userId },
  });

  if (!existingAddress) {
    return failure("NOT_FOUND", "沒有地址資料可刪除");
  }

  await prisma.userAddress.delete({
    where: { userId },
  });

  return success({ message: "地址已刪除" });
}

// ============================================
// Bank Actions
// ============================================

export const updateBankAction = safeAction(updateBankSchema, async (input) => {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const userId = auth.data.id;
  const { bankName, accountNumber, accountHolderName, fpsId, fpsEnabled, notes } = input;

  const updatedBankAccount = await prisma.userBankAccount.upsert({
    where: { userId },
    update: {
      bankName,
      accountNumber,
      accountHolderName,
      fpsId: fpsId || null,
      fpsEnabled: fpsEnabled || false,
      notes: notes || null,
    },
    create: {
      userId,
      bankName,
      accountNumber,
      accountHolderName,
      fpsId: fpsId || null,
      fpsEnabled: fpsEnabled || false,
      notes: notes || null,
    },
  });

  return success({ message: "收款資料更新成功", bankAccount: updatedBankAccount });
});

export async function deleteBankAction() {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const userId = auth.data.id;

  const existingAccount = await prisma.userBankAccount.findUnique({
    where: { userId },
  });

  if (!existingAccount) {
    return failure("NOT_FOUND", "沒有收款資料可刪除");
  }

  await prisma.userBankAccount.delete({
    where: { userId },
  });

  return success({ message: "收款資料已刪除" });
}

// ============================================
// Children Actions
// ============================================

export const createChildAction = safeAction(createChildSchema, async (input) => {
  const clientIP = await getClientIP();
  const rateLimitResult = await rateLimit(`child_create:${clientIP}`, RATE_LIMIT_CONFIGS.CHILD_CREATE);

  if (!rateLimitResult.success) {
    return failure("RATE_LIMITED", "請求過於頻繁，請稍後再試");
  }

  const auth = await requireUser();
  if (!auth.ok) return auth;

  const userId = auth.data.id;
  const { nameChinese, nameEnglish, birthYear, school, gender } = input;

  let birthYearNum: number | null = null;
  if (birthYear) {
    birthYearNum = parseInt(birthYear, 10);
  }

  const child = await createChildWithMemberNumber({
    parentId: userId,
    nameChinese,
    nameEnglish: nameEnglish || null,
    birthYear: birthYearNum,
    school: school || null,
    gender: gender || null,
  });

  return success({ message: "學員新增成功", child });
});

export const updateChildAction = safeAction(updateChildSchema, async (input) => {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const userId = auth.data.id;
  const { id, nameChinese, nameEnglish, birthYear, school, gender } = input;

  const existingChild = await prisma.userChild.findFirst({
    where: {
      id,
      parentId: userId,
      deletedAt: null,
    },
  });

  if (!existingChild) {
    return failure("NOT_FOUND", "學員不存在");
  }

  let birthYearNum: number | null = null;
  if (birthYear) {
    birthYearNum = parseInt(birthYear, 10);
  }

  const child = await prisma.userChild.update({
    where: { id },
    data: {
      nameChinese,
      nameEnglish: nameEnglish || null,
      birthYear: birthYearNum,
      school: school || null,
      gender: gender || null,
    },
    select: {
      id: true,
      memberNumber: true,
      nameChinese: true,
      nameEnglish: true,
      birthYear: true,
      school: true,
      gender: true,
    },
  });

  return success({ message: "學員資料更新成功", child });
});

export const deleteChildAction = safeAction(deleteChildSchema, async (input) => {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const userId = auth.data.id;
  const { id } = input;

  const existingChild = await prisma.userChild.findFirst({
    where: {
      id,
      parentId: userId,
      deletedAt: null,
    },
  });

  if (!existingChild) {
    return failure("NOT_FOUND", "學員不存在");
  }

  await prisma.userChild.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return success({ message: "學員已刪除" });
});

// ============================================
// Tutor Document Actions
// ============================================

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateFileType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

function validateFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 100);
}

export async function createTutorDocumentAction(formData: FormData) {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const userId = auth.data.id;

  const documentType = formData.get("documentType") as DocumentType;
  const name = formData.get("name") as string;
  const referenceNumber = formData.get("referenceNumber") as string | null;
  const certificateType = formData.get("certificateType") as string | null;
  const issuingBody = formData.get("issuingBody") as string | null;
  const issueDate = formData.get("issueDate") as string | null;
  const expiryDate = formData.get("expiryDate") as string | null;
  const file = formData.get("file") as File | null;

  if (!documentType || !name) {
    return failure("VALIDATION_ERROR", "請填寫必要欄位");
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
      documentType,
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

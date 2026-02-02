/**
 * User Feature - Server Queries
 * 資料查詢函式（供 Server Components 使用）
 */

import { prisma } from "@/lib/db";
import { requireUser, success, failure, type ActionResult } from "@/lib/actions";

// ============================================
// Profile Query
// ============================================

export async function getProfile(): Promise<
  ActionResult<{
    id: string;
    memberNumber: string | null;
    title: string | null;
    phone: string | null;
    email: string | null;
    nameChinese: string | null;
    nameEnglish: string | null;
    nickname: string | null;
    gender: string | null;
    identityCardNumber: string | null;
    whatsappEnabled: boolean;
    role: string;
  }>
> {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const user = await prisma.user.findUnique({
    where: { id: auth.data.id },
    select: {
      id: true,
      memberNumber: true,
      title: true,
      phone: true,
      email: true,
      nameChinese: true,
      nameEnglish: true,
      nickname: true,
      gender: true,
      identityCardNumber: true,
      whatsappEnabled: true,
      role: true,
    },
  });

  if (!user) {
    return failure("NOT_FOUND", "用戶不存在");
  }

  return success(user);
}

// ============================================
// Address Query
// ============================================

export async function getAddress(): Promise<
  ActionResult<{
    id: string;
    region: string | null;
    district: string | null;
    address: string | null;
  } | null>
> {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const address = await prisma.userAddress.findUnique({
    where: { userId: auth.data.id },
    select: {
      id: true,
      region: true,
      district: true,
      address: true,
    },
  });

  return success(address);
}

// ============================================
// Bank Query
// ============================================

export async function getBankAccount(): Promise<
  ActionResult<{
    id: string;
    bankName: string | null;
    accountNumber: string | null;
    accountHolderName: string | null;
    fpsId: string | null;
    fpsEnabled: boolean;
    notes: string | null;
  } | null>
> {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const bankAccount = await prisma.userBankAccount.findUnique({
    where: { userId: auth.data.id },
    select: {
      id: true,
      bankName: true,
      accountNumber: true,
      accountHolderName: true,
      fpsId: true,
      fpsEnabled: true,
      notes: true,
    },
  });

  return success(bankAccount);
}

// ============================================
// Children Query
// ============================================

export async function getChildren(): Promise<
  ActionResult<
    Array<{
      id: string;
      memberNumber: string | null;
      nameChinese: string | null;
      nameEnglish: string | null;
      birthYear: number | null;
      school: string | null;
      gender: string | null;
    }>
  >
> {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const children = await prisma.userChild.findMany({
    where: {
      parentId: auth.data.id,
      deletedAt: null,
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
    orderBy: {
      createdAt: "asc",
    },
  });

  return success(children);
}

// ============================================
// Tutor Documents Query
// ============================================

export async function getTutorDocuments(documentType?: string): Promise<
  ActionResult<
    Array<{
      id: string;
      documentType: string;
      name: string;
      status: string;
      referenceNumber: string | null;
      certificateType: string | null;
      issuingBody: string | null;
      issueDate: Date | null;
      expiryDate: Date | null;
      documentUrl: string | null;
      uploadDate: Date | null;
    }>
  >
> {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId: auth.data.id },
    include: {
      documents: documentType
        ? { where: { documentType: documentType as never } }
        : true,
    },
  });

  if (!tutorProfile) {
    return success([]);
  }

  return success(tutorProfile.documents);
}

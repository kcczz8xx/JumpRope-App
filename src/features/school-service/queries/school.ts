/**
 * School Service Queries - 學校查詢
 */

import { prisma } from "@/lib/db";
import { requireUser, success, failure, type ActionResult } from "@/lib/actions";

export async function getSchools(): Promise<
  ActionResult<
    Array<{
      id: string;
      schoolName: string;
      createdAt: Date;
    }>
  >
> {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const schools = await prisma.school.findMany({
    where: {
      deletedAt: null,
    },
    select: {
      id: true,
      schoolName: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const uniqueSchools = schools.reduce((acc, school) => {
    if (!acc.has(school.schoolName)) {
      acc.set(school.schoolName, school);
    }
    return acc;
  }, new Map<string, (typeof schools)[0]>());

  const result = Array.from(uniqueSchools.values()).sort((a, b) =>
    a.schoolName.localeCompare(b.schoolName, "zh-Hant")
  );

  return success(result);
}

export async function getSchoolById(
  id: string
): Promise<
  ActionResult<{
    id: string;
    schoolName: string;
    schoolNameEn: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    partnershipStartDate: Date | null;
    partnershipEndDate: Date | null;
    partnershipStartYear: string | null;
    partnershipStatus: string | null;
    confirmationChannel: string | null;
    remarks: string | null;
    contacts: Array<{
      id: string;
      nameChinese: string | null;
      nameEnglish: string | null;
      position: string | null;
      phone: string | null;
      mobile: string | null;
      email: string | null;
      isPrimary: boolean;
    }>;
  }>
> {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  if (!id) {
    return failure("VALIDATION_ERROR", "缺少學校 ID");
  }

  const school = await prisma.school.findUnique({
    where: { id },
    include: {
      contacts: {
        where: {
          deletedAt: null,
        },
        orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!school || school.deletedAt) {
    return failure("NOT_FOUND", "學校不存在");
  }

  return success(school);
}

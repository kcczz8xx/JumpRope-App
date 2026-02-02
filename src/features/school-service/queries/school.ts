/**
 * School Service Queries - 學校查詢
 *
 * 使用 createAction wrapper 自動處理認證和錯誤
 */

import { prisma } from "@/lib/db";
import { createAction, success } from "@/lib/patterns";
import { failureFromCode } from "@/features/_core/error-codes";

type SchoolListItem = {
  id: string;
  schoolName: string;
  createdAt: Date;
};

type SchoolDetail = {
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
};

/**
 * 獲取學校列表（去重並按名稱排序）
 */
export const getSchoolsAction = createAction<void, SchoolListItem[]>(
  async (_, ctx) => {
    if (!ctx.session?.user) {
      return failureFromCode("PERMISSION", "UNAUTHORIZED");
    }

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
  },
  {
    requireAuth: true,
  }
);

type SchoolByIdInput = { id: string };

/**
 * 根據 ID 獲取學校詳情
 */
export const getSchoolByIdAction = createAction<SchoolByIdInput, SchoolDetail>(
  async (input, ctx) => {
    if (!ctx.session?.user) {
      return failureFromCode("PERMISSION", "UNAUTHORIZED");
    }

    if (!input.id) {
      return failureFromCode("VALIDATION", "MISSING_FIELD");
    }

    const school = await prisma.school.findUnique({
      where: { id: input.id },
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
      return failureFromCode("RESOURCE", "NOT_FOUND");
    }

    return success(school);
  },
  {
    requireAuth: true,
  }
);

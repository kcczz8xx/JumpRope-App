/**
 * User Queries - Children
 * 學員資料查詢
 */

import { prisma } from "@/lib/db";
import { requireUser, success, type ActionResult } from "@/lib/actions";

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
  if (!auth.success) return auth;

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

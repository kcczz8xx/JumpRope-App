/**
 * User Queries - Profile
 * 用戶個人資料查詢
 */

import { prisma } from "@/lib/db";
import { requireUser, success, failure, type ActionResult } from "@/lib/actions";

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

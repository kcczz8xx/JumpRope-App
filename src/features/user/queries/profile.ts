/**
 * User Queries - Profile
 * 用戶個人資料查詢
 *
 * 使用 createAction wrapper 自動處理認證和錯誤
 */

import { prisma } from "@/lib/db";
import { createAction, success } from "@/lib/patterns";
import { failureFromCode } from "@/features/_core/error-codes";

type ProfileData = {
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
};

/**
 * 獲取當前用戶個人資料
 */
export const getProfileAction = createAction<void, ProfileData>(
  async (_, ctx) => {
    if (!ctx.session?.user) {
      return failureFromCode("PERMISSION", "UNAUTHORIZED");
    }

    const user = await prisma.user.findUnique({
      where: { id: ctx.session.user.id },
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
      return failureFromCode("RESOURCE", "NOT_FOUND");
    }

    return success(user);
  },
  {
    requireAuth: true,
  }
);

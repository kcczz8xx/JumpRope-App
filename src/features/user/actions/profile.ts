"use server";

/**
 * User Actions - Profile
 * 用戶個人資料操作
 */

import { prisma } from "@/lib/db";
import { safeAction, success, failure, requireUser } from "@/lib/actions";
import { OTP_CONFIG } from "@/lib/constants/otp";
import { updateProfileSchema } from "../schemas/profile";

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

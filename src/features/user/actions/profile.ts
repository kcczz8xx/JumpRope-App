"use server";

/**
 * User Actions - Profile
 * 用戶個人資料操作
 *
 * 使用 createAction wrapper 自動處理：
 * - Schema 驗證
 * - 認證檢查
 * - 審計日誌
 * - 錯誤處理
 */

import { prisma } from "@/lib/db";
import { createAction, success } from "@/lib/patterns";
import { failureFromCode } from "@/features/_core/error-codes";
import { OTP_CONFIG } from "@/lib/constants/otp";
import { updateProfileSchema, type UpdateProfileInput } from "../schemas/profile";

/**
 * 更新用戶個人資料
 */
export const updateProfileAction = createAction<
  UpdateProfileInput,
  { message: string; user: { id: string; nickname: string | null; email: string | null; phone: string; whatsappEnabled: boolean } }
>(
  async (input, ctx) => {
    if (!ctx.session?.user) {
      return failureFromCode("PERMISSION", "UNAUTHORIZED");
    }

    const userId = ctx.session.user.id;
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
            return failureFromCode("AUTH", "EMAIL_NOT_VERIFIED");
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
          return failureFromCode("AUTH", "EMAIL_IN_USE");
        }
      }
      updateData.email = email || null;
    }

    if (phone !== undefined) {
      if (!phone) {
        return failureFromCode("VALIDATION", "PHONE_REQUIRED");
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
          return failureFromCode("AUTH", "PHONE_NOT_VERIFIED");
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
        return failureFromCode("AUTH", "PHONE_IN_USE");
      }
      updateData.phone = phone;
    }

    if (whatsappEnabled !== undefined) {
      updateData.whatsappEnabled = whatsappEnabled;
    }

    if (Object.keys(updateData).length === 0) {
      return failureFromCode("VALIDATION", "NO_UPDATE_DATA");
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
  },
  {
    schema: updateProfileSchema,
    requireAuth: true,
    audit: true,
    auditAction: "USER_PROFILE_UPDATE",
    auditResource: "user",
    auditResourceId: () => undefined,
  }
);

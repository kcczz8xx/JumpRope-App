"use server";

/**
 * Auth Actions - 密碼管理
 * 修改密碼和重設密碼
 *
 * 使用 createAction wrapper 自動處理：
 * - Schema 驗證
 * - 審計日誌
 * - 錯誤處理
 */

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createAction, success } from "@/lib/patterns";
import { failureFromCode } from "@/features/_core/error-codes";
import { rateLimit, RATE_LIMIT_CONFIGS } from "@/lib/server";
import { OTP_CONFIG } from "@/lib/constants/otp";
import {
  changePasswordSchema,
  resetPasswordSendSchema,
  resetPasswordVerifySchema,
  resetPasswordSchema,
} from "../schemas/password";
import { getClientIP, generateOtpCode, hashToken } from "./_helpers";
import type { z } from "zod";

type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
type ResetPasswordSendInput = z.infer<typeof resetPasswordSendSchema>;
type ResetPasswordVerifyInput = z.infer<typeof resetPasswordVerifySchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * 修改密碼（需登入）
 */
export const changePasswordAction = createAction<
  ChangePasswordInput,
  { message: string }
>(
  async (input, ctx) => {
    if (!ctx.session?.user) {
      return failureFromCode("PERMISSION", "UNAUTHORIZED");
    }

    const { currentPassword, newPassword } = input;
    const userId = ctx.session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return failureFromCode("RESOURCE", "NOT_FOUND");
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );
    if (!isPasswordValid) {
      return failureFromCode("AUTH", "INVALID_PASSWORD");
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return success({ message: "密碼修改成功" });
  },
  {
    schema: changePasswordSchema,
    requireAuth: true,
    audit: true,
    auditAction: "PASSWORD_CHANGE",
    auditResource: "user",
  }
);

/**
 * 發送重設密碼驗證碼
 */
export const resetPasswordSendAction = createAction<
  ResetPasswordSendInput,
  { method: string; message: string }
>(
  async (input) => {
    // 速率限制
    const clientIP = await getClientIP();
    const rateLimitResult = await rateLimit(
      `reset_send:${clientIP}`,
      RATE_LIMIT_CONFIGS.RESET_PASSWORD
    );

    if (!rateLimitResult.success) {
      return failureFromCode("RATE_LIMIT", "EXCEEDED");
    }

    const { phone, email } = input;

    if (email && !phone) {
      return failureFromCode("VALIDATION", "EMAIL_RESET_NOT_AVAILABLE");
    }

    const user = await prisma.user.findFirst({
      where: phone ? { phone } : { email },
    });

    if (!user) {
      return failureFromCode("RESOURCE", "NOT_FOUND");
    }

    if (phone) {
      await prisma.otp.deleteMany({
        where: { phone, purpose: "RESET_PASSWORD", verified: false },
      });

      const code = generateOtpCode();
      const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MS);

      await prisma.otp.create({
        data: { phone, code, purpose: "RESET_PASSWORD", expiresAt },
      });
    }

    return success({ method: "phone", message: "驗證碼已發送" });
  },
  {
    schema: resetPasswordSendSchema,
    audit: true,
    auditAction: "PASSWORD_RESET_SEND",
    auditResource: "otp",
  }
);

/**
 * 驗證重設密碼驗證碼
 */
export const resetPasswordVerifyAction = createAction<
  ResetPasswordVerifyInput,
  { verified: boolean; resetToken: string; message: string }
>(
  async (input) => {
    // 速率限制
    const clientIP = await getClientIP();
    const rateLimitResult = await rateLimit(
      `reset_verify:${clientIP}`,
      RATE_LIMIT_CONFIGS.OTP_VERIFY
    );

    if (!rateLimitResult.success) {
      return failureFromCode("RATE_LIMIT", "EXCEEDED");
    }

    const { phone, code } = input;

    const otp = await prisma.otp.findFirst({
      where: { phone, purpose: "RESET_PASSWORD", verified: false },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return failureFromCode("OTP", "NOT_FOUND");
    }

    if (new Date() > otp.expiresAt) {
      return failureFromCode("OTP", "EXPIRED");
    }

    if (otp.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      return failureFromCode("OTP", "MAX_ATTEMPTS");
    }

    if (otp.code !== code) {
      await prisma.otp.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      return failureFromCode("OTP", "INVALID");
    }

    await prisma.otp.update({
      where: { id: otp.id },
      data: { verified: true },
    });

    // 清理舊的重設令牌
    await prisma.passwordResetToken.deleteMany({
      where: { phone, used: false },
    });

    // 創建新的重設令牌
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(resetToken);
    const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { phone, token: tokenHash, expiresAt: tokenExpiresAt },
    });

    return success({ verified: true, resetToken, message: "驗證成功" });
  },
  {
    schema: resetPasswordVerifySchema,
    audit: true,
    auditAction: "PASSWORD_RESET_VERIFY",
    auditResource: "otp",
  }
);

/**
 * 重設密碼
 */
export const resetPasswordAction = createAction<
  ResetPasswordInput,
  { message: string }
>(
  async (input) => {
    // 速率限制
    const clientIP = await getClientIP();
    const rateLimitResult = await rateLimit(
      `reset_password:${clientIP}`,
      RATE_LIMIT_CONFIGS.RESET_PASSWORD
    );

    if (!rateLimitResult.success) {
      return failureFromCode("RATE_LIMIT", "EXCEEDED");
    }

    const { phone, password, resetToken } = input;

    // 驗證重設令牌
    const tokenHash = hashToken(resetToken);
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: { phone, token: tokenHash, used: false },
    });

    if (!tokenRecord) {
      return failureFromCode("AUTH", "INVALID_RESET_TOKEN");
    }

    if (new Date() > tokenRecord.expiresAt) {
      return failureFromCode("AUTH", "RESET_TOKEN_EXPIRED");
    }

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return failureFromCode("RESOURCE", "NOT_FOUND");
    }

    // 更新密碼
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { phone },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { used: true },
      }),
    ]);

    return success({ message: "密碼重設成功" });
  },
  {
    schema: resetPasswordSchema,
    audit: true,
    auditAction: "PASSWORD_RESET",
    auditResource: "user",
  }
);

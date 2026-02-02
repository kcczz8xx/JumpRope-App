"use server";

/**
 * Auth Actions - 密碼管理
 * 修改密碼和重設密碼
 */

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { safeAction, success, failure, requireUser } from "@/lib/actions";
import { rateLimit, RATE_LIMIT_CONFIGS } from "@/lib/server";
import { OTP_CONFIG } from "@/lib/constants/otp";
import {
  changePasswordSchema,
  resetPasswordSendSchema,
  resetPasswordVerifySchema,
  resetPasswordSchema,
} from "../schemas/password";
import { getClientIP, generateOtpCode, hashToken } from "./_helpers";

/**
 * 修改密碼（需登入）
 */
export const changePasswordAction = safeAction(changePasswordSchema, async (input) => {
  const userResult = await requireUser();
  if (!userResult.ok) return userResult;

  const { currentPassword, newPassword } = input;
  const userId = userResult.data.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user || !user.passwordHash) {
    return failure("NOT_FOUND", "用戶不存在或無法修改密碼");
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isPasswordValid) {
    return failure("VALIDATION_ERROR", "目前密碼不正確");
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });

  return success({ message: "密碼修改成功" });
});

/**
 * 發送重設密碼驗證碼
 */
export const resetPasswordSendAction = safeAction(resetPasswordSendSchema, async (input) => {
  const clientIP = await getClientIP();
  const rateLimitResult = await rateLimit(`reset_send:${clientIP}`, RATE_LIMIT_CONFIGS.RESET_PASSWORD);

  if (!rateLimitResult.success) {
    return failure("RATE_LIMITED", "請求過於頻繁，請稍後再試");
  }

  const { phone, email } = input;

  if (email && !phone) {
    return failure("VALIDATION_ERROR", "電郵重設功能尚未開放，請使用電話號碼重設密碼");
  }

  const user = await prisma.user.findFirst({
    where: phone ? { phone } : { email },
  });

  if (!user) {
    return failure("NOT_FOUND", phone ? "此電話號碼未註冊" : "此電郵地址未註冊");
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
});

/**
 * 驗證重設密碼驗證碼
 */
export const resetPasswordVerifyAction = safeAction(resetPasswordVerifySchema, async (input) => {
  const clientIP = await getClientIP();
  const rateLimitResult = await rateLimit(`reset_verify:${clientIP}`, RATE_LIMIT_CONFIGS.OTP_VERIFY);

  if (!rateLimitResult.success) {
    return failure("RATE_LIMITED", "請求過於頻繁，請稍後再試");
  }

  const { phone, code } = input;

  const otp = await prisma.otp.findFirst({
    where: { phone, purpose: "RESET_PASSWORD", verified: false },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    return failure("NOT_FOUND", "驗證碼不存在，請重新發送");
  }

  if (new Date() > otp.expiresAt) {
    return failure("VALIDATION_ERROR", "驗證碼已過期，請重新發送");
  }

  if (otp.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
    return failure("RATE_LIMITED", "嘗試次數過多，請重新發送驗證碼");
  }

  if (otp.code !== code) {
    await prisma.otp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    return failure("VALIDATION_ERROR", "驗證碼錯誤");
  }

  await prisma.otp.update({
    where: { id: otp.id },
    data: { verified: true },
  });

  await prisma.passwordResetToken.deleteMany({
    where: { phone, used: false },
  });

  const resetToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(resetToken);
  const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { phone, token: tokenHash, expiresAt: tokenExpiresAt },
  });

  return success({ verified: true, resetToken, message: "驗證成功" });
});

/**
 * 重設密碼
 */
export const resetPasswordAction = safeAction(resetPasswordSchema, async (input) => {
  const clientIP = await getClientIP();
  const rateLimitResult = await rateLimit(`reset_password:${clientIP}`, RATE_LIMIT_CONFIGS.RESET_PASSWORD);

  if (!rateLimitResult.success) {
    return failure("RATE_LIMITED", "請求過於頻繁，請稍後再試");
  }

  const { phone, password, resetToken } = input;

  const tokenHash = hashToken(resetToken);
  const tokenRecord = await prisma.passwordResetToken.findFirst({
    where: { phone, token: tokenHash, used: false },
  });

  if (!tokenRecord) {
    return failure("VALIDATION_ERROR", "重設令牌無效");
  }

  if (new Date() > tokenRecord.expiresAt) {
    return failure("VALIDATION_ERROR", "重設令牌已過期，請重新驗證");
  }

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    return failure("NOT_FOUND", "用戶不存在");
  }

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
});

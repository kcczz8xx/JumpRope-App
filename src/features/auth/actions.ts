"use server";

/**
 * Auth Feature - Server Actions
 * 認證相關的伺服器操作
 */

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { OtpPurpose } from "@prisma/client";
import { safeAction, success, failure, requireUser } from "@/lib/actions";
import { rateLimit, RATE_LIMIT_CONFIGS } from "@/lib/server";
import { createUserWithMemberNumber } from "@/lib/services";
import { OTP_CONFIG } from "@/lib/constants/otp";
import {
  sendOtpSchema,
  verifyOtpSchema,
  registerSchema,
  changePasswordSchema,
  resetPasswordSendSchema,
  resetPasswordVerifySchema,
  resetPasswordSchema,
} from "./schema";

async function getClientIP(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIP = headersList.get("x-real-ip");
  if (realIP) return realIP;
  return "unknown";
}

function generateOtpCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function mapPurpose(purpose: "register" | "reset-password" | "update-contact"): OtpPurpose {
  if (purpose === "register") return OtpPurpose.REGISTER;
  if (purpose === "reset-password") return OtpPurpose.RESET_PASSWORD;
  return OtpPurpose.UPDATE_CONTACT;
}

/**
 * 發送 OTP 驗證碼
 */
export const sendOtpAction = safeAction(sendOtpSchema, async (input) => {
  const clientIP = await getClientIP();
  const rateLimitResult = await rateLimit(`otp_send:${clientIP}`, RATE_LIMIT_CONFIGS.OTP_SEND);

  if (!rateLimitResult.success) {
    return failure("RATE_LIMITED", "請求過於頻繁，請稍後再試");
  }

  const { phone, email, purpose } = input;

  if (purpose === "register") {
    if (!email) {
      return failure("VALIDATION_ERROR", "請提供電郵地址");
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ phone }, { email }] },
    });

    if (existingUser) {
      if (existingUser.phone === phone) {
        return failure("CONFLICT", "此電話號碼已被註冊");
      }
      if (existingUser.email === email) {
        return failure("CONFLICT", "此電郵地址已被註冊");
      }
    }
  }

  if (purpose === "reset-password") {
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (!existingUser) {
      return failure("NOT_FOUND", "此電話號碼未註冊");
    }
  }

  const otpPurpose = mapPurpose(purpose);

  await prisma.otp.deleteMany({
    where: { phone, purpose: otpPurpose, verified: false },
  });

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MS);

  await prisma.otp.create({
    data: { phone, code, purpose: otpPurpose, expiresAt },
  });

  return success({ phone, message: "驗證碼已發送" });
});

/**
 * 驗證 OTP 驗證碼
 */
export const verifyOtpAction = safeAction(verifyOtpSchema, async (input) => {
  const clientIP = await getClientIP();
  const rateLimitResult = await rateLimit(`otp_verify:${clientIP}`, RATE_LIMIT_CONFIGS.OTP_VERIFY);

  if (!rateLimitResult.success) {
    return failure("RATE_LIMITED", "請求過於頻繁，請稍後再試");
  }

  const { phone, code, purpose } = input;
  const otpPurpose = mapPurpose(purpose);

  const otp = await prisma.otp.findFirst({
    where: { phone, purpose: otpPurpose, verified: false },
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

  return success({ verified: true, message: "驗證成功" });
});

/**
 * 用戶註冊
 */
export const registerAction = safeAction(registerSchema, async (input) => {
  const clientIP = await getClientIP();
  const rateLimitResult = await rateLimit(`register:${clientIP}`, RATE_LIMIT_CONFIGS.REGISTER);

  if (!rateLimitResult.success) {
    return failure("RATE_LIMITED", "請求過於頻繁，請稍後再試");
  }

  const { phone, password, email, nickname, title } = input;

  const verifiedOtp = await prisma.otp.findFirst({
    where: {
      phone,
      purpose: "REGISTER",
      verified: true,
      expiresAt: { gte: new Date(Date.now() - OTP_CONFIG.REGISTER_VERIFY_WINDOW_MS) },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!verifiedOtp) {
    return failure("FORBIDDEN", "請先完成電話號碼驗證");
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ phone }, { email }] },
  });

  if (existingUser) {
    if (existingUser.phone === phone) {
      return failure("CONFLICT", "此電話號碼已被註冊");
    }
    if (existingUser.email === email) {
      return failure("CONFLICT", "此電郵地址已被註冊");
    }
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await createUserWithMemberNumber({
    phone,
    email,
    nickname,
    title,
    passwordHash,
    role: "USER",
  });

  await prisma.otp.deleteMany({
    where: { phone, purpose: "REGISTER", verified: true },
  });

  return success({ userId: user.id, message: "註冊成功" });
});

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

"use server";

/**
 * Auth Actions - OTP 相關
 * 發送和驗證 OTP 驗證碼
 */

import { prisma } from "@/lib/db";
import { safeAction, success, failure } from "@/lib/actions";
import { rateLimit, RATE_LIMIT_CONFIGS } from "@/lib/server";
import { OTP_CONFIG } from "@/lib/constants/otp";
import { sendOtpSchema, verifyOtpSchema } from "../schemas/otp";
import { getClientIP, generateOtpCode, mapPurpose } from "./_helpers";

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

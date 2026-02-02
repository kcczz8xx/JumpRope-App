"use server";

/**
 * Auth Actions - OTP 相關
 * 發送和驗證 OTP 驗證碼
 *
 * 使用 createAction wrapper 自動處理：
 * - Schema 驗證
 * - 審計日誌
 * - 錯誤處理
 *
 * 速率限制保留使用 Upstash Redis（性能更好）
 */

import { prisma } from "@/lib/db";
import { createAction, success, failure } from "@/lib/patterns";
import { rateLimit, RATE_LIMIT_CONFIGS } from "@/lib/server";
import { OTP_CONFIG } from "@/lib/constants/otp";
import { sendOtpSchema, verifyOtpSchema } from "../schemas/otp";
import { getClientIP, generateOtpCode, mapPurpose } from "./_helpers";
import type { z } from "zod";

type SendOtpInput = z.infer<typeof sendOtpSchema>;
type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

/**
 * 發送 OTP 驗證碼
 */
export const sendOtpAction = createAction<
  SendOtpInput,
  { phone: string; message: string }
>(
  async (input) => {
    // 速率限制（使用 Upstash Redis）
    const clientIP = await getClientIP();
    const rateLimitResult = await rateLimit(
      `otp_send:${clientIP}`,
      RATE_LIMIT_CONFIGS.OTP_SEND
    );

    if (!rateLimitResult.success) {
      return failure("RATE_LIMITED", "請求過於頻繁，請稍後再試");
    }

    const { phone, email, purpose } = input;

    // 註冊時檢查用戶是否已存在
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

    // 重設密碼時檢查用戶是否存在
    if (purpose === "reset-password") {
      const existingUser = await prisma.user.findUnique({ where: { phone } });
      if (!existingUser) {
        return failure("NOT_FOUND", "此電話號碼未註冊");
      }
    }

    const otpPurpose = mapPurpose(purpose);

    // 刪除舊的未驗證 OTP
    await prisma.otp.deleteMany({
      where: { phone, purpose: otpPurpose, verified: false },
    });

    // 創建新 OTP
    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MS);

    await prisma.otp.create({
      data: { phone, code, purpose: otpPurpose, expiresAt },
    });

    return success({ phone, message: "驗證碼已發送" });
  },
  {
    schema: sendOtpSchema,
    audit: true,
    auditAction: "OTP_SEND",
    auditResource: "otp",
  }
);

/**
 * 驗證 OTP 驗證碼
 */
export const verifyOtpAction = createAction<
  VerifyOtpInput,
  { verified: boolean; message: string }
>(
  async (input) => {
    // 速率限制（使用 Upstash Redis）
    const clientIP = await getClientIP();
    const rateLimitResult = await rateLimit(
      `otp_verify:${clientIP}`,
      RATE_LIMIT_CONFIGS.OTP_VERIFY
    );

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
  },
  {
    schema: verifyOtpSchema,
    audit: true,
    auditAction: "OTP_VERIFY",
    auditResource: "otp",
  }
);

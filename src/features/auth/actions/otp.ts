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
import { createAction, success } from "@/lib/patterns";
import { failureFromCode } from "@/features/_core/error-codes";
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
      return failureFromCode("RATE_LIMIT", "EXCEEDED");
    }

    const { phone, email, purpose } = input;

    // 註冊時檢查用戶是否已存在
    if (purpose === "register") {
      if (!email) {
        return failureFromCode("VALIDATION", "MISSING_EMAIL");
      }

      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ phone }, { email }] },
      });

      if (existingUser) {
        if (existingUser.phone === phone) {
          return failureFromCode("AUTH", "PHONE_REGISTERED");
        }
        if (existingUser.email === email) {
          return failureFromCode("AUTH", "EMAIL_REGISTERED");
        }
      }
    }

    // 重設密碼時檢查用戶是否存在
    if (purpose === "reset-password") {
      const existingUser = await prisma.user.findUnique({ where: { phone } });
      if (!existingUser) {
        return failureFromCode("RESOURCE", "NOT_FOUND");
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
      return failureFromCode("RATE_LIMIT", "EXCEEDED");
    }

    const { phone, code, purpose } = input;
    const otpPurpose = mapPurpose(purpose);

    const otp = await prisma.otp.findFirst({
      where: { phone, purpose: otpPurpose, verified: false },
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

    return success({ verified: true, message: "驗證成功" });
  },
  {
    schema: verifyOtpSchema,
    audit: true,
    auditAction: "OTP_VERIFY",
    auditResource: "otp",
  }
);

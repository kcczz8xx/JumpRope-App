"use server";

/**
 * Auth Actions - 用戶註冊
 *
 * 使用 createAction wrapper 自動處理：
 * - Schema 驗證
 * - 審計日誌
 * - 錯誤處理
 */

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createAction, success, failure } from "@/lib/patterns";
import { rateLimit, RATE_LIMIT_CONFIGS } from "@/lib/server";
import { createUserWithMemberNumber } from "@/lib/services";
import { OTP_CONFIG } from "@/lib/constants/otp";
import { registerSchema } from "../schemas/register";
import { getClientIP } from "./_helpers";
import type { z } from "zod";

type RegisterInput = z.infer<typeof registerSchema>;

/**
 * 用戶註冊
 */
export const registerAction = createAction<
  RegisterInput,
  { userId: string; message: string }
>(
  async (input) => {
    // 速率限制
    const clientIP = await getClientIP();
    const rateLimitResult = await rateLimit(
      `register:${clientIP}`,
      RATE_LIMIT_CONFIGS.REGISTER
    );

    if (!rateLimitResult.success) {
      return failure("RATE_LIMITED", "請求過於頻繁，請稍後再試");
    }

    const { phone, password, email, nickname, title } = input;

    // 檢查 OTP 是否已驗證
    const verifiedOtp = await prisma.otp.findFirst({
      where: {
        phone,
        purpose: "REGISTER",
        verified: true,
        expiresAt: {
          gte: new Date(Date.now() - OTP_CONFIG.REGISTER_VERIFY_WINDOW_MS),
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verifiedOtp) {
      return failure("FORBIDDEN", "請先完成電話號碼驗證");
    }

    // 檢查用戶是否已存在
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

    // 創建用戶
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await createUserWithMemberNumber({
      phone,
      email,
      nickname,
      title,
      passwordHash,
      role: "USER",
    });

    // 清理已使用的 OTP
    await prisma.otp.deleteMany({
      where: { phone, purpose: "REGISTER", verified: true },
    });

    return success({ userId: user.id, message: "註冊成功" });
  },
  {
    schema: registerSchema,
    audit: true,
    auditAction: "USER_REGISTER",
    auditResource: "user",
    auditResourceId: () => undefined, // 註冊時還沒有 userId
  }
);

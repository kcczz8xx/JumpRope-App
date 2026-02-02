"use server";

/**
 * Auth Actions - 用戶註冊
 */

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { safeAction, success, failure } from "@/lib/actions";
import { rateLimit, RATE_LIMIT_CONFIGS } from "@/lib/server";
import { createUserWithMemberNumber } from "@/lib/services";
import { OTP_CONFIG } from "@/lib/constants/otp";
import { registerSchema } from "../schemas/register";
import { getClientIP } from "./_helpers";

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

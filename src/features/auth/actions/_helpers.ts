/**
 * Auth Actions - 共用輔助函式
 * _ 前綴避免被 index 導出
 */

import crypto from "crypto";
import { headers } from "next/headers";
import { OtpPurpose } from "@prisma/client";

export async function getClientIP(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIP = headersList.get("x-real-ip");
  if (realIP) return realIP;
  return "unknown";
}

export function generateOtpCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function mapPurpose(purpose: "register" | "reset-password" | "update-contact"): OtpPurpose {
  if (purpose === "register") return OtpPurpose.REGISTER;
  if (purpose === "reset-password") return OtpPurpose.RESET_PASSWORD;
  return OtpPurpose.UPDATE_CONTACT;
}

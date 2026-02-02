"use server";

/**
 * User Actions - Shared Helpers
 * 共用輔助函式
 */

import { headers } from "next/headers";

export async function getClientIP(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIP = headersList.get("x-real-ip");
  if (realIP) return realIP;
  return "unknown";
}

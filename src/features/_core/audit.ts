/**
 * 審計日誌模組
 *
 * 記錄所有重要操作，用於安全審計和問題追蹤
 */

import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// ===== 型別定義 =====

export interface AuditEntry {
  requestId?: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  input?: Record<string, unknown>;
  result: "success" | "failure";
  errorCode?: string;
  metadata?: Record<string, unknown>;
  /** 客戶端 IP 地址（可選，若未提供則從 headers 取得） */
  ipAddress?: string;
  /** 客戶端 User-Agent（可選，若未提供則從 headers 取得） */
  userAgent?: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  resource?: string;
  result?: "success" | "failure";
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// ===== 敏感資料遮蔽 =====

const SENSITIVE_FIELDS = [
  "password",
  "newPassword",
  "oldPassword",
  "currentPassword",
  "otp",
  "token",
  "secret",
  "apiKey",
  "passwordHash",
];

function maskSensitiveData(
  data: Record<string, unknown>
): Record<string, unknown> {
  const masked = { ...data };

  for (const field of SENSITIVE_FIELDS) {
    if (field in masked) {
      masked[field] = "***MASKED***";
    }
  }

  return masked;
}

// ===== 審計日誌 =====

/**
 * 記錄審計日誌
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    // 優先使用傳入的值，否則從 headers 取得
    let ipAddress = entry.ipAddress;
    let userAgent = entry.userAgent;

    if (!ipAddress || !userAgent) {
      const headersList = await headers();
      ipAddress =
        ipAddress ||
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headersList.get("x-real-ip") ||
        "unknown";
      userAgent = userAgent || headersList.get("user-agent") || "unknown";
    }

    // 遮蔽敏感資料
    const maskedInput = entry.input ? maskSensitiveData(entry.input) : null;

    await prisma.auditLog.create({
      data: {
        requestId: entry.requestId,
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        input: maskedInput ? JSON.stringify(maskedInput) : null,
        result: entry.result,
        errorCode: entry.errorCode,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // 審計失敗不應該阻止主要操作
    console.error("[Audit] Failed to log:", error);
  }
}

/**
 * 查詢審計日誌
 */
export async function getAuditLogs(filters: AuditLogFilters = {}) {
  return prisma.auditLog.findMany({
    where: {
      userId: filters.userId,
      action: filters.action,
      resource: filters.resource,
      result: filters.result,
      createdAt: {
        gte: filters.startDate,
        lte: filters.endDate,
      },
    },
    orderBy: { createdAt: "desc" },
    take: filters.limit || 100,
    skip: filters.offset || 0,
    include: {
      user: {
        select: {
          id: true,
          nameChinese: true,
          nameEnglish: true,
          email: true,
        },
      },
    },
  });
}

/**
 * 獲取用戶最近的操作
 */
export async function getUserRecentActions(userId: string, limit: number = 10) {
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      action: true,
      resource: true,
      result: true,
      createdAt: true,
    },
  });
}

/**
 * 獲取資源的操作歷史
 */
export async function getResourceHistory(
  resource: string,
  resourceId: string,
  limit: number = 50
) {
  return prisma.auditLog.findMany({
    where: { resource, resourceId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          nameChinese: true,
          nameEnglish: true,
        },
      },
    },
  });
}

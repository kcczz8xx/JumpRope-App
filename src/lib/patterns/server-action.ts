/**
 * Server Action Wrapper
 *
 * 自動處理：
 * 1. Schema 驗證
 * 2. 認證檢查
 * 3. 角色檢查
 * 4. 所有權檢查
 * 5. 速率限制
 * 6. 審計日誌
 * 7. 錯誤處理
 *
 * 注意：此檔案不需要 "use server" 指令
 * createAction 是 factory 函式，返回的閉包才是 server action
 * 調用方（如 otp.ts）已有 "use server" 標記
 */

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createErrorResponse } from "@/features/_core/error-codes";
import { logAudit } from "@/features/_core/audit";
import { UserRole } from "@prisma/client";
import {
  type ActionResult,
  type ActionContext,
  type ActionOptions,
  type RateLimitConfig,
  success,
  failure,
} from "./types";

// ===== 速率限制 =====

async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<boolean> {
  const now = Date.now();
  const windowStart = now - config.window * 1000;

  try {
    // 清理過期記錄
    await prisma.rateLimitLog.deleteMany({
      where: {
        key,
        createdAt: { lt: new Date(windowStart) },
      },
    });

    // 計算當前窗口內的請求數
    const count = await prisma.rateLimitLog.count({
      where: {
        key,
        createdAt: { gte: new Date(windowStart) },
      },
    });

    if (count >= config.max) {
      return true; // rate limited
    }

    // 記錄本次請求
    await prisma.rateLimitLog.create({
      data: { key },
    });

    return false;
  } catch (error) {
    console.error("Rate limit check failed:", error);
    return false; // 失敗時不阻止請求
  }
}

// ===== 主要 Wrapper =====

export function createAction<TInput, TOutput>(
  handler: (
    input: TInput,
    ctx: ActionContext
  ) => Promise<ActionResult<TOutput>>,
  options: ActionOptions<TInput> = {}
) {
  return async (rawInput: TInput): Promise<ActionResult<TOutput>> => {
    const requestId = crypto.randomUUID();
    const timestamp = new Date();

    try {
      // 1. Schema 驗證
      let input = rawInput;
      if (options.schema) {
        try {
          input = options.schema.parse(rawInput);
        } catch (e) {
          const zodError = e as { errors?: unknown };
          return createErrorResponse("VALIDATION", "INVALID_INPUT", {
            errors: zodError.errors,
          }) as unknown as ActionResult<TOutput>;
        }
      }

      // 2. 認證檢查
      const session = await auth();
      if (options.requireAuth && !session?.user) {
        return createErrorResponse(
          "PERMISSION",
          "UNAUTHORIZED"
        ) as unknown as ActionResult<TOutput>;
      }

      // 3. 角色檢查
      if (options.requiredRole && session?.user) {
        const roles = Array.isArray(options.requiredRole)
          ? options.requiredRole
          : [options.requiredRole];

        if (!roles.includes(session.user.role as UserRole)) {
          return createErrorResponse(
            "PERMISSION",
            "ROLE_REQUIRED"
          ) as unknown as ActionResult<TOutput>;
        }
      }

      // 4. 所有權檢查
      if (options.ownershipCheck && session?.user) {
        const isOwner = await options.ownershipCheck(input, session.user.id);
        if (!isOwner) {
          return createErrorResponse(
            "PERMISSION",
            "NOT_OWNER"
          ) as unknown as ActionResult<TOutput>;
        }
      }

      // 5. 速率限制
      if (options.rateLimitKey && options.rateLimitConfig) {
        const key =
          typeof options.rateLimitKey === "function"
            ? options.rateLimitKey(input)
            : options.rateLimitKey;

        const isLimited = await checkRateLimit(key, options.rateLimitConfig);
        if (isLimited) {
          return createErrorResponse(
            "RATE_LIMIT",
            "EXCEEDED"
          ) as unknown as ActionResult<TOutput>;
        }
      }

      // 6. 獲取客戶端資訊
      const headersList = await headers();
      const ipAddress =
        headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        headersList.get("x-real-ip") ||
        "unknown";
      const userAgent = headersList.get("user-agent") || "unknown";

      // 7. 執行 handler
      const ctx: ActionContext = {
        session: session
          ? {
            user: {
              id: session.user.id,
              role: session.user.role as UserRole,
              email: session.user.email,
              phone: (session.user as { phone?: string }).phone,
            },
          }
          : null,
        requestId,
        timestamp,
        ipAddress,
        userAgent,
      };

      const result = await handler(input, ctx);

      // 8. 審計日誌（成功）
      if (options.audit) {
        await logAudit({
          requestId,
          userId: session?.user?.id,
          action: options.auditAction || "UNKNOWN",
          resource: options.auditResource || "UNKNOWN",
          resourceId: options.auditResourceId?.(input),
          input: input as Record<string, unknown>,
          result: result.success ? "success" : "failure",
          errorCode: result.success ? undefined : result.error.code,
          ipAddress,
          userAgent,
        });
      }

      return result;
    } catch (error) {
      // 錯誤處理
      console.error(`[${requestId}] Action error:`, error);

      // 審計日誌（失敗）
      if (options.audit) {
        const session = await auth();
        await logAudit({
          requestId,
          userId: session?.user?.id,
          action: options.auditAction || "UNKNOWN",
          resource: options.auditResource || "UNKNOWN",
          result: "failure",
          errorCode: "INTERNAL_ERROR",
          metadata: { error: String(error) },
        });
      }

      return createErrorResponse(
        "DATABASE",
        "QUERY_FAILED"
      ) as unknown as ActionResult<TOutput>;
    }
  };
}

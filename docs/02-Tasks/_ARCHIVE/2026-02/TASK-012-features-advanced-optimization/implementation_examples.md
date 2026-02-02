# JumpRope-App 架構優化 - 實現範例

本文檔提供完整的代碼實現範例，可直接用於開發。

---

## 1. 錯誤碼系統完整實現

### 1.1 `src/features/_core/error-codes.ts`

```typescript
/**
 * 統一錯誤碼系統
 * 
 * 設計原則：
 * 1. 單一真實來源
 * 2. 編譯期型別檢查
 * 3. 自動 HTTP 狀態碼映射
 * 4. i18n 支持
 */

export interface ErrorDefinition {
  code: string;
  status: number;
  i18n: string;
  message: string;
}

export const ERROR_CODES = {
  // ===== 認證相關 =====
  AUTH: {
    PHONE_REGISTERED: {
      code: "AUTH_001",
      status: 409,
      i18n: "errors.auth.phone_registered",
      message: "此手機號碼已註冊",
    },
    INVALID_CREDENTIALS: {
      code: "AUTH_002",
      status: 401,
      i18n: "errors.auth.invalid_credentials",
      message: "帳號或密碼錯誤",
    },
    SESSION_EXPIRED: {
      code: "AUTH_003",
      status: 401,
      i18n: "errors.auth.session_expired",
      message: "登入已過期，請重新登入",
    },
    NOT_VERIFIED: {
      code: "AUTH_004",
      status: 403,
      i18n: "errors.auth.not_verified",
      message: "帳號尚未驗證",
    },
    ACCOUNT_LOCKED: {
      code: "AUTH_005",
      status: 423,
      i18n: "errors.auth.account_locked",
      message: "帳號已被鎖定",
    },
  },

  // ===== OTP 相關 =====
  OTP: {
    EXPIRED: {
      code: "OTP_001",
      status: 400,
      i18n: "errors.otp.expired",
      message: "驗證碼已過期",
    },
    INVALID: {
      code: "OTP_002",
      status: 400,
      i18n: "errors.otp.invalid",
      message: "驗證碼錯誤",
    },
    MAX_ATTEMPTS: {
      code: "OTP_003",
      status: 429,
      i18n: "errors.otp.max_attempts",
      message: "驗證次數超過限制",
    },
    SEND_FAILED: {
      code: "OTP_004",
      status: 503,
      i18n: "errors.otp.send_failed",
      message: "驗證碼發送失敗",
    },
    ALREADY_SENT: {
      code: "OTP_005",
      status: 429,
      i18n: "errors.otp.already_sent",
      message: "驗證碼已發送，請稍後再試",
    },
  },

  // ===== 驗證相關 =====
  VALIDATION: {
    INVALID_INPUT: {
      code: "VAL_001",
      status: 400,
      i18n: "errors.validation.invalid_input",
      message: "輸入資料格式錯誤",
    },
    MISSING_FIELD: {
      code: "VAL_002",
      status: 400,
      i18n: "errors.validation.missing_field",
      message: "缺少必要欄位",
    },
    INVALID_FORMAT: {
      code: "VAL_003",
      status: 400,
      i18n: "errors.validation.invalid_format",
      message: "資料格式不正確",
    },
    INVALID_PHONE: {
      code: "VAL_004",
      status: 400,
      i18n: "errors.validation.invalid_phone",
      message: "手機號碼格式不正確",
    },
    INVALID_EMAIL: {
      code: "VAL_005",
      status: 400,
      i18n: "errors.validation.invalid_email",
      message: "電子郵件格式不正確",
    },
  },

  // ===== 權限相關 =====
  PERMISSION: {
    UNAUTHORIZED: {
      code: "PERM_001",
      status: 401,
      i18n: "errors.permission.unauthorized",
      message: "請先登入",
    },
    FORBIDDEN: {
      code: "PERM_002",
      status: 403,
      i18n: "errors.permission.forbidden",
      message: "您沒有執行此操作的權限",
    },
    NOT_OWNER: {
      code: "PERM_003",
      status: 403,
      i18n: "errors.permission.not_owner",
      message: "您不是此資源的擁有者",
    },
    ROLE_REQUIRED: {
      code: "PERM_004",
      status: 403,
      i18n: "errors.permission.role_required",
      message: "需要特定角色才能執行此操作",
    },
  },

  // ===== 速率限制 =====
  RATE_LIMIT: {
    EXCEEDED: {
      code: "RATE_001",
      status: 429,
      i18n: "errors.rate_limit.exceeded",
      message: "請求過於頻繁，請稍後再試",
    },
    OTP_SEND: {
      code: "RATE_002",
      status: 429,
      i18n: "errors.rate_limit.otp_send",
      message: "驗證碼發送次數過多，請稍後再試",
    },
  },

  // ===== 資源相關 =====
  RESOURCE: {
    NOT_FOUND: {
      code: "RES_001",
      status: 404,
      i18n: "errors.resource.not_found",
      message: "找不到指定的資源",
    },
    ALREADY_EXISTS: {
      code: "RES_002",
      status: 409,
      i18n: "errors.resource.already_exists",
      message: "資源已存在",
    },
    CONFLICT: {
      code: "RES_003",
      status: 409,
      i18n: "errors.resource.conflict",
      message: "資源狀態衝突",
    },
    DELETED: {
      code: "RES_004",
      status: 410,
      i18n: "errors.resource.deleted",
      message: "資源已被刪除",
    },
  },

  // ===== 資料庫相關 =====
  DATABASE: {
    CONNECTION_FAILED: {
      code: "DB_001",
      status: 503,
      i18n: "errors.database.connection_failed",
      message: "資料庫連線失敗",
    },
    QUERY_FAILED: {
      code: "DB_002",
      status: 500,
      i18n: "errors.database.query_failed",
      message: "資料庫查詢失敗",
    },
    TRANSACTION_FAILED: {
      code: "DB_003",
      status: 500,
      i18n: "errors.database.transaction_failed",
      message: "資料庫交易失敗",
    },
  },

  // ===== 外部服務相關 =====
  EXTERNAL: {
    SMS_FAILED: {
      code: "EXT_001",
      status: 503,
      i18n: "errors.external.sms_failed",
      message: "簡訊服務暫時無法使用",
    },
    PAYMENT_FAILED: {
      code: "EXT_002",
      status: 503,
      i18n: "errors.external.payment_failed",
      message: "付款服務暫時無法使用",
    },
    EMAIL_FAILED: {
      code: "EXT_003",
      status: 503,
      i18n: "errors.external.email_failed",
      message: "郵件服務暫時無法使用",
    },
  },

  // ===== 業務邏輯相關 =====
  BUSINESS: {
    SCHOOL_HAS_COURSES: {
      code: "BIZ_001",
      status: 409,
      i18n: "errors.business.school_has_courses",
      message: "學校仍有課程，無法刪除",
    },
    COURSE_HAS_STUDENTS: {
      code: "BIZ_002",
      status: 409,
      i18n: "errors.business.course_has_students",
      message: "課程仍有學生，無法刪除",
    },
    ENROLLMENT_CLOSED: {
      code: "BIZ_003",
      status: 400,
      i18n: "errors.business.enrollment_closed",
      message: "報名已截止",
    },
  },
} as const;

// ===== 型別推導 =====

export type ErrorCategory = keyof typeof ERROR_CODES;

export type ErrorCode<T extends ErrorCategory> = keyof (typeof ERROR_CODES)[T];

export type AnyErrorCode = {
  [K in ErrorCategory]: `${K}.${string & ErrorCode<K>}`;
}[ErrorCategory];

// ===== 輔助函式 =====

/**
 * 獲取錯誤定義
 */
export function getError<T extends ErrorCategory>(
  category: T,
  code: ErrorCode<T>
): ErrorDefinition {
  return ERROR_CODES[category][code] as ErrorDefinition;
}

/**
 * 創建錯誤回應
 */
export function createErrorResponse<T extends ErrorCategory>(
  category: T,
  code: ErrorCode<T>,
  details?: Record<string, unknown>
) {
  const error = getError(category, code);
  return {
    success: false as const,
    error: {
      code: error.code,
      message: error.message,
      i18n: error.i18n,
      details,
    },
    status: error.status,
  };
}

/**
 * 檢查是否為特定錯誤
 */
export function isError<T extends ErrorCategory>(
  response: { error?: { code?: string } },
  category: T,
  code: ErrorCode<T>
): boolean {
  const error = getError(category, code);
  return response.error?.code === error.code;
}
```

---

## 2. Server Action Wrapper 完整實現

### 2.1 `src/lib/patterns/types.ts`

```typescript
/**
 * Server Action 共用型別
 */

import { Role } from "@prisma/client";

// ===== Action 結果型別 =====

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ActionError };

export interface ActionError {
  code: string;
  message: string;
  i18n?: string;
  details?: unknown;
}

// ===== Action 上下文 =====

export interface ActionContext {
  session: SessionData | null;
  requestId: string;
  timestamp: Date;
}

export interface SessionData {
  user: {
    id: string;
    role: Role;
    email?: string | null;
    phone?: string | null;
  };
}

// ===== Action 選項 =====

export interface RateLimitConfig {
  /** 時間窗口內最大請求數 */
  max: number;
  /** 時間窗口（秒） */
  window: number;
}

export interface ActionOptions<TInput> {
  /** 是否需要認證 */
  requireAuth?: boolean;

  /** 需要的角色（單一或多個） */
  requiredRole?: Role | Role[];

  /** 所有權檢查函式 */
  ownershipCheck?: (input: TInput, userId: string) => Promise<boolean>;

  /** 速率限制 key（字串或函式） */
  rateLimitKey?: string | ((input: TInput) => string);

  /** 速率限制配置 */
  rateLimitConfig?: RateLimitConfig;

  /** 是否啟用審計 */
  audit?: boolean;

  /** 審計動作名稱 */
  auditAction?: string;

  /** 審計資源類型 */
  auditResource?: string;

  /** 從輸入提取資源 ID */
  auditResourceId?: (input: TInput) => string | undefined;

  /** Zod schema（可選，用於自動驗證） */
  schema?: { parse: (input: unknown) => TInput };
}
```

### 2.2 `src/lib/patterns/server-action.ts`

```typescript
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
 */

"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createErrorResponse } from "@/features/_core/error-codes";
import { logAudit } from "@/features/_core/audit";
import { Role } from "@prisma/client";
import type {
  ActionResult,
  ActionContext,
  ActionOptions,
  RateLimitConfig,
} from "./types";

// ===== 輔助函式 =====

export function success<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function failure(
  code: string,
  message: string,
  details?: unknown
): ActionResult<never> {
  return {
    success: false,
    error: { code, message, details },
  };
}

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

        if (!roles.includes(session.user.role as Role)) {
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

      // 6. 執行 handler
      const ctx: ActionContext = {
        session: session
          ? {
              user: {
                id: session.user.id,
                role: session.user.role as Role,
                email: session.user.email,
                phone: (session.user as { phone?: string }).phone,
              },
            }
          : null,
        requestId,
        timestamp,
      };

      const result = await handler(input, ctx);

      // 7. 審計日誌（成功）
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
```

### 2.3 `src/lib/patterns/index.ts`

```typescript
/**
 * Server Action Patterns - 公開 API
 */

export { createAction, success, failure } from "./server-action";
export type {
  ActionResult,
  ActionContext,
  ActionOptions,
  ActionError,
  RateLimitConfig,
  SessionData,
} from "./types";
```

---

## 3. Feature Core 模組完整實現

### 3.1 `src/features/_core/permission.ts`

```typescript
/**
 * 權限驗證模組
 * 
 * 提供 RBAC（角色基礎存取控制）和所有權檢查
 */

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

// ===== RBAC 權限矩陣 =====

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  SUPER_ADMIN: ["*"], // 超級管理員擁有所有權限
  ADMIN: [
    "school:read",
    "school:write",
    "school:delete",
    "course:read",
    "course:write",
    "course:delete",
    "user:read",
    "user:write",
    "report:read",
  ],
  TEACHER: [
    "school:read",
    "course:read",
    "course:write",
    "student:read",
    "student:write",
    "attendance:read",
    "attendance:write",
  ],
  STUDENT: [
    "course:read",
    "enrollment:read",
    "enrollment:write",
    "progress:read",
  ],
  USER: [
    "profile:read",
    "profile:write",
  ],
};

// ===== 權限檢查 =====

/**
 * 檢查當前用戶是否有指定權限
 */
export async function checkPermission(
  resource: string,
  action: "read" | "write" | "delete"
): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const permission = `${resource}:${action}`;
  const userRole = session.user.role as Role;
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];

  // 超級管理員擁有所有權限
  if (userPermissions.includes("*")) return true;

  return userPermissions.includes(permission);
}

/**
 * 要求指定權限，無權限時拋出錯誤
 */
export async function requirePermission(
  resource: string,
  action: "read" | "write" | "delete"
): Promise<void> {
  const hasPermission = await checkPermission(resource, action);
  if (!hasPermission) {
    throw new Error("PERMISSION_DENIED");
  }
}

/**
 * 檢查用戶是否有指定角色
 */
export async function hasRole(
  requiredRole: Role | Role[]
): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(session.user.role as Role);
}

// ===== 所有權檢查 =====

type OwnershipResource = "school" | "course" | "enrollment";

/**
 * 檢查當前用戶是否為資源擁有者
 */
export async function checkOwnership(
  resource: OwnershipResource,
  resourceId: string
): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  // 超級管理員視為所有資源的擁有者
  if (session.user.role === "SUPER_ADMIN") return true;

  switch (resource) {
    case "school": {
      const school = await prisma.school.findUnique({
        where: { id: resourceId },
        select: { createdById: true },
      });
      return school?.createdById === session.user.id;
    }

    case "course": {
      const course = await prisma.course.findUnique({
        where: { id: resourceId },
        select: { createdById: true, school: { select: { createdById: true } } },
      });
      // 課程創建者或所屬學校創建者
      return (
        course?.createdById === session.user.id ||
        course?.school?.createdById === session.user.id
      );
    }

    case "enrollment": {
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: resourceId },
        select: { studentId: true },
      });
      return enrollment?.studentId === session.user.id;
    }

    default:
      return false;
  }
}

/**
 * 創建所有權檢查函式（用於 Action Wrapper）
 */
export function createOwnershipChecker(resource: OwnershipResource) {
  return async (
    input: { id?: string; schoolId?: string; courseId?: string },
    userId: string
  ): Promise<boolean> => {
    const resourceId = input.id || input.schoolId || input.courseId;
    if (!resourceId) return false;

    const session = await auth();
    if (session?.user?.role === "SUPER_ADMIN") return true;

    return checkOwnership(resource, resourceId);
  };
}
```

### 3.2 `src/features/_core/audit.ts`

```typescript
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
  "otp",
  "token",
  "secret",
  "apiKey",
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
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

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
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * 獲取用戶最近的操作
 */
export async function getUserRecentActions(
  userId: string,
  limit: number = 10
) {
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
          name: true,
        },
      },
    },
  });
}
```

### 3.3 `src/features/_core/constants.ts`

```typescript
/**
 * 共用常數
 */

// ===== OTP 相關 =====
export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 5;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

// ===== 速率限制 =====
export const RATE_LIMITS = {
  OTP_SEND: { max: 5, window: 3600 },      // 每小時 5 次
  OTP_VERIFY: { max: 10, window: 3600 },   // 每小時 10 次
  LOGIN: { max: 10, window: 900 },          // 每 15 分鐘 10 次
  REGISTER: { max: 3, window: 3600 },       // 每小時 3 次
  PASSWORD_RESET: { max: 3, window: 3600 }, // 每小時 3 次
  API_GENERAL: { max: 100, window: 60 },    // 每分鐘 100 次
} as const;

// ===== 分頁 =====
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ===== 檔案上傳 =====
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// ===== 業務邏輯 =====
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_SCHOOL_NAME_LENGTH = 100;
export const MAX_COURSE_NAME_LENGTH = 100;
```

### 3.4 `src/features/_core/index.ts`

```typescript
/**
 * Feature Core - 公開 API
 * 
 * 提供跨 feature 的共用功能
 */

// 錯誤碼
export {
  ERROR_CODES,
  getError,
  createErrorResponse,
  isError,
  type ErrorCategory,
  type ErrorCode,
  type ErrorDefinition,
} from "./error-codes";

// 權限
export {
  checkPermission,
  requirePermission,
  hasRole,
  checkOwnership,
  createOwnershipChecker,
} from "./permission";

// 審計
export {
  logAudit,
  getAuditLogs,
  getUserRecentActions,
  getResourceHistory,
  type AuditEntry,
  type AuditLogFilters,
} from "./audit";

// 常數
export * from "./constants";
```

---

## 4. Prisma Schema 更新

### 4.1 新增 Model

```prisma
// prisma/schema.prisma

// ===== 審計日誌 =====
model AuditLog {
  id         String   @id @default(cuid())
  requestId  String?
  userId     String?
  action     String
  resource   String
  resourceId String?
  input      String?  @db.Text
  result     String   // "success" | "failure"
  errorCode  String?
  metadata   String?  @db.Text
  ipAddress  String?
  userAgent  String?  @db.Text
  createdAt  DateTime @default(now())

  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([action])
  @@index([resource])
  @@index([resourceId])
  @@index([result])
  @@index([createdAt])
}

// ===== 速率限制記錄 =====
model RateLimitLog {
  id        String   @id @default(cuid())
  key       String
  createdAt DateTime @default(now())

  @@index([key])
  @@index([createdAt])
  @@index([key, createdAt])
}
```

### 4.2 Migration 指令

```bash
pnpm prisma migrate dev --name add_audit_and_rate_limit
```

---

## 5. 遷移範例

### 5.1 `auth/actions/otp.ts` 遷移前後對比

#### 遷移前

```typescript
"use server";

import { prisma } from "@/lib/db";
import { sendOtpSchema } from "../schemas";
import { z } from "zod";

export async function sendOtpAction(
  input: z.infer<typeof sendOtpSchema>
) {
  // 1. 驗證輸入
  const validated = sendOtpSchema.parse(input);

  // 2. 速率限制檢查
  const rateLimitKey = `otp:send:${validated.phone}`;
  const recentCount = await prisma.otpLog.count({
    where: {
      phone: validated.phone,
      createdAt: { gte: new Date(Date.now() - 3600000) },
    },
  });
  if (recentCount >= 5) {
    return { success: false, error: "RATE_LIMITED" };
  }

  // 3. 生成 OTP
  const otp = Math.random().toString().slice(2, 8);

  // 4. 儲存 OTP
  await prisma.otp.upsert({
    where: { phone: validated.phone },
    create: { phone: validated.phone, code: otp },
    update: { code: otp, attempts: 0 },
  });

  // 5. 發送 SMS
  await sendSms(validated.phone, `您的驗證碼是：${otp}`);

  return { success: true, data: { sent: true } };
}
```

#### 遷移後

```typescript
"use server";

import { prisma } from "@/lib/db";
import { createAction, success, failure } from "@/lib/patterns";
import { RATE_LIMITS, OTP_LENGTH } from "@/features/_core";
import { sendOtpSchema, SendOtpInput } from "../schemas";

export const sendOtpAction = createAction<SendOtpInput, { sent: boolean }>(
  async (input, ctx) => {
    // 只需要專注核心邏輯
    const otp = generateOtp(OTP_LENGTH);

    await prisma.otp.upsert({
      where: { phone: input.phone },
      create: { phone: input.phone, code: otp },
      update: { code: otp, attempts: 0 },
    });

    await sendSms(input.phone, `您的驗證碼是：${otp}`);

    return success({ sent: true });
  },
  {
    requireAuth: false,
    schema: sendOtpSchema,
    rateLimitKey: (input) => `otp:send:${input.phone}`,
    rateLimitConfig: RATE_LIMITS.OTP_SEND,
    audit: true,
    auditAction: "OTP_SEND",
    auditResource: "otp",
  }
);

function generateOtp(length: number): string {
  return Math.random().toString().slice(2, 2 + length);
}

async function sendSms(phone: string, message: string): Promise<void> {
  // SMS 發送邏輯
}
```

### 5.2 `school-service/actions/school.ts` 遷移範例

#### 遷移後

```typescript
"use server";

import { prisma } from "@/lib/db";
import { createAction, success } from "@/lib/patterns";
import { createOwnershipChecker, createErrorResponse } from "@/features/_core";
import { createSchoolSchema, updateSchoolSchema } from "../schemas";
import type { CreateSchoolInput, UpdateSchoolInput } from "../schemas";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

// ===== 建立學校 =====

export const createSchoolAction = createAction<
  CreateSchoolInput,
  { id: string }
>(
  async (input, ctx) => {
    if (!ctx.session?.user) {
      return createErrorResponse("PERMISSION", "UNAUTHORIZED") as never;
    }

    const school = await prisma.school.create({
      data: {
        ...input,
        createdById: ctx.session.user.id,
      },
    });

    revalidatePath("/schools");

    return success({ id: school.id });
  },
  {
    requireAuth: true,
    requiredRole: [Role.ADMIN, Role.SUPER_ADMIN],
    schema: createSchoolSchema,
    audit: true,
    auditAction: "SCHOOL_CREATE",
    auditResource: "school",
  }
);

// ===== 更新學校 =====

export const updateSchoolAction = createAction<
  UpdateSchoolInput & { id: string },
  { updated: boolean }
>(
  async (input, ctx) => {
    const { id, ...data } = input;

    await prisma.school.update({
      where: { id },
      data,
    });

    revalidatePath(`/schools/${id}`);
    revalidatePath("/schools");

    return success({ updated: true });
  },
  {
    requireAuth: true,
    requiredRole: [Role.ADMIN, Role.SUPER_ADMIN],
    ownershipCheck: createOwnershipChecker("school"),
    schema: updateSchoolSchema,
    audit: true,
    auditAction: "SCHOOL_UPDATE",
    auditResource: "school",
    auditResourceId: (input) => input.id,
  }
);

// ===== 刪除學校 =====

export const deleteSchoolAction = createAction<
  { id: string },
  { deleted: boolean }
>(
  async (input, ctx) => {
    // 檢查是否有關聯課程
    const courseCount = await prisma.course.count({
      where: { schoolId: input.id },
    });

    if (courseCount > 0) {
      return createErrorResponse("BUSINESS", "SCHOOL_HAS_COURSES") as never;
    }

    await prisma.school.delete({
      where: { id: input.id },
    });

    revalidatePath("/schools");

    return success({ deleted: true });
  },
  {
    requireAuth: true,
    requiredRole: [Role.ADMIN, Role.SUPER_ADMIN],
    ownershipCheck: createOwnershipChecker("school"),
    audit: true,
    auditAction: "SCHOOL_DELETE",
    auditResource: "school",
    auditResourceId: (input) => input.id,
  }
);
```

---

## 6. 檢查清單

### Phase 1 完成檢查

- [ ] `src/features/_core/` 目錄已建立
- [ ] `error-codes.ts` 已實現並導出
- [ ] `permission.ts` 已實現並導出
- [ ] `audit.ts` 已實現並導出
- [ ] `constants.ts` 已實現並導出
- [ ] `index.ts` 統一導出
- [ ] `src/lib/patterns/` 目錄已建立
- [ ] `types.ts` 已實現
- [ ] `server-action.ts` 已實現
- [ ] `index.ts` 統一導出
- [ ] Prisma schema 已更新（AuditLog, RateLimitLog）
- [ ] Migration 已執行
- [ ] 單元測試通過

### Phase 2 完成檢查

- [ ] `auth/actions/otp.ts` 已遷移
- [ ] `auth/actions/register.ts` 已遷移
- [ ] `auth/actions/password.ts` 已遷移
- [ ] `school-service/actions/school.ts` 已遷移
- [ ] `school-service/actions/course.ts` 已遷移
- [ ] `school-service/actions/batch.ts` 已遷移
- [ ] 所有現有功能正常運作
- [ ] `pnpm build` 通過
- [ ] `pnpm test` 通過

### Phase 3 完成檢查

- [ ] `STRUCTURE.md` 已更新
- [ ] `create-feature.js` 已更新
- [ ] 遷移指南已建立

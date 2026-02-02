/**
 * Server Action 共用型別與輔助函式
 */

import { UserRole } from "@prisma/client";

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

// ===== 輔助函式（純函式，非 Server Action）=====

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

// ===== Action 上下文 =====

export interface ActionContext {
  session: SessionData | null;
  requestId: string;
  timestamp: Date;
}

export interface SessionData {
  user: {
    id: string;
    role: UserRole;
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
  requiredRole?: UserRole | UserRole[];

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

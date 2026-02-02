/**
 * 統一錯誤碼系統
 *
 * 設計原則：
 * 1. 單一真實來源
 * 2. 編譯期型別檢查
 * 3. 自動 HTTP 狀態碼映射
 * 4. i18n 支持
 *
 * @example
 * // 舊用法（仍支持）
 * import { ERROR_CODES, failureFromCode } from '@/features/_core/error-codes';
 * failureFromCode("AUTH", "PHONE_REGISTERED");
 *
 * // 新用法（推薦）
 * import { AUTH_ERRORS, failureFromCode } from '@/features/_core/error-codes';
 * failureFromCode("AUTH", "PHONE_REGISTERED");
 */

export type { ErrorDefinition } from "./types";
export {
  AUTH_ERRORS,
  OTP_ERRORS,
  VALIDATION_ERRORS,
  PERMISSION_ERRORS,
  RATE_LIMIT_ERRORS,
  RESOURCE_ERRORS,
  DATABASE_ERRORS,
  EXTERNAL_ERRORS,
  BUSINESS_ERRORS,
} from "./categories";

import { AUTH_ERRORS } from "./categories/auth";
import { OTP_ERRORS } from "./categories/otp";
import { VALIDATION_ERRORS } from "./categories/validation";
import { PERMISSION_ERRORS } from "./categories/permission";
import { RATE_LIMIT_ERRORS } from "./categories/rate-limit";
import { RESOURCE_ERRORS } from "./categories/resource";
import { DATABASE_ERRORS } from "./categories/database";
import { EXTERNAL_ERRORS } from "./categories/external";
import { BUSINESS_ERRORS } from "./categories/business";
import type { ErrorDefinition } from "./types";

/**
 * 統一錯誤碼常量（向後兼容）
 */
export const ERROR_CODES = {
  AUTH: AUTH_ERRORS,
  OTP: OTP_ERRORS,
  VALIDATION: VALIDATION_ERRORS,
  PERMISSION: PERMISSION_ERRORS,
  RATE_LIMIT: RATE_LIMIT_ERRORS,
  RESOURCE: RESOURCE_ERRORS,
  DATABASE: DATABASE_ERRORS,
  EXTERNAL: EXTERNAL_ERRORS,
  BUSINESS: BUSINESS_ERRORS,
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

/**
 * 創建失敗回應（用於 Server Action handler）
 *
 * 這是 createErrorResponse 的簡化版本，返回符合 ActionResult 的格式
 *
 * @example
 * return failureFromCode("RATE_LIMIT", "EXCEEDED");
 * return failureFromCode("AUTH", "PHONE_REGISTERED");
 */
export function failureFromCode<T extends ErrorCategory>(
  category: T,
  code: ErrorCode<T>,
  details?: Record<string, unknown>
): { success: false; error: { code: string; message: string; i18n: string; details?: Record<string, unknown> } } {
  const error = getError(category, code);
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      i18n: error.i18n,
      details,
    },
  };
}

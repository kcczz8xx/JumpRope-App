/**
 * Server Actions 統一回傳類型
 * 用於所有 Server Actions 的回傳格式
 *
 * 注意：已從 { ok: true/false } 統一為 { success: true/false }
 */

export type ActionErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export type ActionResult<T> =
  | { success: true; data: T }
  | {
    success: false;
    error: {
      code: ActionErrorCode;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };
  };

export function success<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function failure(
  code: ActionErrorCode,
  message: string,
  fieldErrors?: Record<string, string[]>
): ActionResult<never> {
  return { success: false, error: { code, message, fieldErrors } };
}

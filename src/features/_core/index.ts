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

// 權限、審計 — Server-only，使用 server.ts 導入
// import { checkPermission, logAudit } from "@/features/_core/server";

// 權限類型（可在 Client 使用）
export type { Permission, UserRole, OwnershipResourceType } from "./permission";

// 常數
export * from "./constants";

// 原子化欄位系統
export * from "./components/fields";

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

// 權限（封裝 lib/rbac，加入 session 自動取得）
export {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  requirePermission,
  hasRole,
  isRoleAtLeast,
  isAdmin,
  isStaffOrAdmin,
  checkOwnership,
  createOwnershipChecker,
  type Permission,
  type UserRole,
  type OwnershipResourceType,
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

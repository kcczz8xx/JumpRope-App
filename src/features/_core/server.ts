/**
 * Feature Core - Server-only API
 *
 * 這些導出僅適用於 Server Components
 * 使用方式：import { checkPermission, logAudit } from "@/features/_core/server";
 */

import "server-only";

// 權限（使用 @/lib/auth，僅限 Server Components）
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

// 審計（使用 next/headers，僅限 Server Components）
export {
  logAudit,
  getAuditLogs,
  getUserRecentActions,
  getResourceHistory,
  type AuditEntry,
  type AuditLogFilters,
} from "./audit";

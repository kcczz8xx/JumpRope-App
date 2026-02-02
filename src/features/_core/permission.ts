/**
 * 權限驗證模組
 *
 * 封裝 lib/rbac，加入 session 自動取得功能
 * 權限定義位於 @/lib/rbac/permissions.ts（單一來源）
 */

import { auth } from "@/lib/auth";
import {
  hasPermission as rbacHasPermission,
  hasAnyPermission as rbacHasAnyPermission,
  hasAllPermissions as rbacHasAllPermissions,
  isRoleAtLeast as rbacIsRoleAtLeast,
  isAdmin as rbacIsAdmin,
  isStaffOrAdmin as rbacIsStaffOrAdmin,
  type Permission,
  type UserRole,
} from "@/lib/rbac/permissions";
import {
  checkOwnership as rbacCheckOwnership,
  type OwnershipResourceType,
} from "@/lib/rbac/check-permission";

// Re-export types for convenience
export type { Permission, UserRole } from "@/lib/rbac/permissions";

// ===== Session-aware 權限檢查 =====

/**
 * 檢查當前用戶是否有指定權限（自動從 session 取得 role）
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
  const session = await auth();
  return rbacHasPermission(session?.user?.role as UserRole, permission);
}

/**
 * 檢查當前用戶是否有任一指定權限
 */
export async function checkAnyPermission(permissions: Permission[]): Promise<boolean> {
  const session = await auth();
  return rbacHasAnyPermission(session?.user?.role as UserRole, permissions);
}

/**
 * 檢查當前用戶是否有所有指定權限
 */
export async function checkAllPermissions(permissions: Permission[]): Promise<boolean> {
  const session = await auth();
  return rbacHasAllPermissions(session?.user?.role as UserRole, permissions);
}

/**
 * 要求指定權限，無權限時拋出錯誤
 */
export async function requirePermission(permission: Permission): Promise<void> {
  const hasIt = await checkPermission(permission);
  if (!hasIt) {
    throw new Error("PERMISSION_DENIED");
  }
}

/**
 * 檢查用戶是否有指定角色
 */
export async function hasRole(requiredRole: UserRole | UserRole[]): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return roles.includes(session.user.role as UserRole);
}

/**
 * 檢查當前用戶角色是否至少為指定角色
 */
export async function isRoleAtLeast(requiredRole: UserRole): Promise<boolean> {
  const session = await auth();
  return rbacIsRoleAtLeast(session?.user?.role as UserRole, requiredRole);
}

/**
 * 檢查當前用戶是否為管理員
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return rbacIsAdmin(session?.user?.role as UserRole);
}

/**
 * 檢查當前用戶是否為職員或管理員
 */
export async function isStaffOrAdmin(): Promise<boolean> {
  const session = await auth();
  return rbacIsStaffOrAdmin(session?.user?.role as UserRole);
}

// ===== 所有權檢查 =====

// Re-export OwnershipResourceType for convenience
export type { OwnershipResourceType } from "@/lib/rbac/check-permission";

/**
 * 檢查當前用戶是否有資源存取權（自動從 session 取得）
 * 
 * 委託給 lib/rbac/check-permission.ts 實現
 */
export async function checkOwnership(
  resourceType: OwnershipResourceType,
  resourceId: string
): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  return rbacCheckOwnership(
    session.user.id,
    resourceType,
    resourceId,
    session.user.role as UserRole
  );
}

/**
 * 創建所有權檢查函式（用於 Action Wrapper）
 */
export function createOwnershipChecker(resourceType: OwnershipResourceType) {
  return async (
    input: { id?: string; schoolId?: string; courseId?: string },
    _userId: string
  ): Promise<boolean> => {
    const resourceId = input.id || input.schoolId || input.courseId;
    if (!resourceId) return false;

    return checkOwnership(resourceType, resourceId);
  };
}

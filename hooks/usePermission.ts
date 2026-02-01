/**
 * usePermission Hook
 * Client-side 權限檢查，基於 NextAuth session
 */

"use client";

import { useSession } from "next-auth/react";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isRoleAtLeast,
  isAdmin,
  isStaffOrAdmin,
  isTutor,
  ROLE_LABELS,
  type Permission,
  type UserRole,
} from "@/lib/rbac/permissions";

export interface UsePermissionReturn {
  role: UserRole | null;
  roleLabel: string;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;
  isAtLeast: (role: UserRole) => boolean;
  isAdmin: boolean;
  isStaffOrAdmin: boolean;
  isTutor: boolean;
}

export function usePermission(): UsePermissionReturn {
  const { data: session, status } = useSession();

  const role = (session?.user?.role as UserRole) || null;
  const userId = session?.user?.id || null;
  const isAuthenticated = !!session?.user;
  const isLoading = status === "loading";

  return {
    role,
    roleLabel: role ? ROLE_LABELS[role] : "",
    userId,
    isAuthenticated,
    isLoading,
    can: (permission: Permission) => hasPermission(role, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),
    canAll: (permissions: Permission[]) => hasAllPermissions(role, permissions),
    isAtLeast: (requiredRole: UserRole) => isRoleAtLeast(role, requiredRole),
    isAdmin: isAdmin(role),
    isStaffOrAdmin: isStaffOrAdmin(role),
    isTutor: isTutor(role),
  };
}

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = usePermission();
  return { isAuthenticated, isLoading };
}

export function useRequirePermission(permission: Permission) {
  const { can, isAuthenticated, isLoading } = usePermission();
  return {
    hasPermission: can(permission),
    isAuthenticated,
    isLoading,
  };
}

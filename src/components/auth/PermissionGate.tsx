/**
 * PermissionGate 組件
 * 基於權限條件渲染子組件
 */

"use client";

import type { ReactNode } from "react";
import { usePermission } from "@/hooks/usePermission";
import type { Permission, UserRole } from "@/lib/rbac/permissions";

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  role?: UserRole;
  roles?: UserRole[];
  fallback?: ReactNode;
  showLoading?: boolean;
  loadingComponent?: ReactNode;
}

export function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  fallback = null,
  showLoading = false,
  loadingComponent,
}: PermissionGateProps) {
  const { can, canAny, canAll, role: userRole, isLoading } = usePermission();

  if (isLoading) {
    if (showLoading) {
      return loadingComponent || <DefaultLoadingSpinner />;
    }
    return null;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = can(permission);
  } else if (permissions && permissions.length > 0) {
    hasAccess = requireAll ? canAll(permissions) : canAny(permissions);
  } else if (role) {
    hasAccess = userRole === role;
  } else if (roles && roles.length > 0) {
    hasAccess = userRole ? roles.includes(userRole) : false;
  } else {
    hasAccess = true;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RequireAuthProps {
  children: ReactNode;
  fallback?: ReactNode;
  showLoading?: boolean;
}

export function RequireAuth({
  children,
  fallback = null,
  showLoading = false,
}: RequireAuthProps) {
  const { isAuthenticated, isLoading } = usePermission();

  if (isLoading && showLoading) {
    return <DefaultLoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RequireRoleProps {
  children: ReactNode;
  role: UserRole;
  fallback?: ReactNode;
}

export function RequireRole({
  children,
  role,
  fallback = null,
}: RequireRoleProps) {
  return (
    <PermissionGate role={role} fallback={fallback}>
      {children}
    </PermissionGate>
  );
}

interface RequireAdminProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireAdmin({ children, fallback = null }: RequireAdminProps) {
  const { isAdmin } = usePermission();

  if (!isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RequireStaffProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireStaff({ children, fallback = null }: RequireStaffProps) {
  const { isStaffOrAdmin } = usePermission();

  if (!isStaffOrAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

function DefaultLoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-brand-500" />
    </div>
  );
}

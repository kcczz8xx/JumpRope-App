/**
 * Server Actions 權限守衛
 * 用於驗證使用者身份和權限
 */

import { auth } from "@/lib/auth";
import type { UserRole } from "@/lib/rbac/types";
import { hasPermission, type Permission } from "@/lib/rbac/permissions";
import { type ActionResult, failure, success } from "./types";

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
}

export async function requireUser(): Promise<ActionResult<AuthenticatedUser>> {
  const session = await auth();

  if (!session?.user?.id) {
    return failure("UNAUTHORIZED", "請先登入");
  }

  return success({
    id: session.user.id,
    role: session.user.role as UserRole,
  });
}

export async function requirePermission(
  permission: Permission
): Promise<ActionResult<AuthenticatedUser>> {
  const userResult = await requireUser();
  if (!userResult.success) return userResult;

  if (!hasPermission(userResult.data.role, permission)) {
    return failure("FORBIDDEN", "權限不足");
  }

  return userResult;
}

export async function requireRole(
  ...allowedRoles: UserRole[]
): Promise<ActionResult<AuthenticatedUser>> {
  const userResult = await requireUser();
  if (!userResult.success) return userResult;

  if (!allowedRoles.includes(userResult.data.role)) {
    return failure("FORBIDDEN", "權限不足");
  }

  return userResult;
}

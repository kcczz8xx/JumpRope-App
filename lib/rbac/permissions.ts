/**
 * RBAC 權限常數定義
 * 角色與權限映射
 */

import type { UserRole } from "./types";

export type { UserRole } from "./types";

export type Permission =
  | "USER_PROFILE_READ_OWN"
  | "USER_PROFILE_UPDATE_OWN"
  | "USER_PROFILE_READ_ANY"
  | "USER_PROFILE_UPDATE_ANY"
  | "TUTOR_DOCUMENT_READ_OWN"
  | "TUTOR_DOCUMENT_CREATE"
  | "TUTOR_DOCUMENT_UPDATE_OWN"
  | "TUTOR_DOCUMENT_DELETE_OWN"
  | "TUTOR_DOCUMENT_READ_ANY"
  | "TUTOR_DOCUMENT_APPROVE"
  | "CHILD_READ_OWN"
  | "CHILD_CREATE"
  | "CHILD_UPDATE_OWN"
  | "CHILD_DELETE_OWN"
  | "CHILD_READ_ANY"
  | "COURSE_READ"
  | "COURSE_CREATE"
  | "COURSE_UPDATE"
  | "COURSE_DELETE"
  | "LESSON_READ_OWN"
  | "LESSON_READ_ANY"
  | "LESSON_CREATE"
  | "LESSON_UPDATE"
  | "QUOTATION_READ"
  | "QUOTATION_CREATE"
  | "INVOICE_READ"
  | "INVOICE_CREATE"
  | "ADMIN_DASHBOARD"
  | "STAFF_DASHBOARD"
  | "USER_MANAGEMENT";

export const PERMISSIONS: Record<Permission, UserRole[]> = {
  USER_PROFILE_READ_OWN: ["USER", "TUTOR", "PARENT", "STUDENT", "STAFF", "ADMIN"],
  USER_PROFILE_UPDATE_OWN: ["USER", "TUTOR", "PARENT", "STUDENT"],
  USER_PROFILE_READ_ANY: ["STAFF", "ADMIN"],
  USER_PROFILE_UPDATE_ANY: ["ADMIN"],

  TUTOR_DOCUMENT_READ_OWN: ["TUTOR"],
  TUTOR_DOCUMENT_CREATE: ["TUTOR"],
  TUTOR_DOCUMENT_UPDATE_OWN: ["TUTOR"],
  TUTOR_DOCUMENT_DELETE_OWN: ["TUTOR"],
  TUTOR_DOCUMENT_READ_ANY: ["STAFF", "ADMIN"],
  TUTOR_DOCUMENT_APPROVE: ["STAFF", "ADMIN"],

  CHILD_READ_OWN: ["PARENT"],
  CHILD_CREATE: ["PARENT"],
  CHILD_UPDATE_OWN: ["PARENT"],
  CHILD_DELETE_OWN: ["PARENT"],
  CHILD_READ_ANY: ["TUTOR", "STAFF", "ADMIN"],

  COURSE_READ: ["USER", "TUTOR", "PARENT", "STUDENT", "STAFF", "ADMIN"],
  COURSE_CREATE: ["STAFF", "ADMIN"],
  COURSE_UPDATE: ["STAFF", "ADMIN"],
  COURSE_DELETE: ["ADMIN"],

  LESSON_READ_OWN: ["TUTOR"],
  LESSON_READ_ANY: ["STAFF", "ADMIN"],
  LESSON_CREATE: ["STAFF", "ADMIN"],
  LESSON_UPDATE: ["STAFF", "ADMIN"],

  QUOTATION_READ: ["STAFF", "ADMIN"],
  QUOTATION_CREATE: ["STAFF", "ADMIN"],
  INVOICE_READ: ["STAFF", "ADMIN"],
  INVOICE_CREATE: ["STAFF", "ADMIN"],

  ADMIN_DASHBOARD: ["ADMIN"],
  STAFF_DASHBOARD: ["STAFF", "ADMIN"],
  USER_MANAGEMENT: ["ADMIN"],
};

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 100,
  STAFF: 80,
  TUTOR: 60,
  PARENT: 40,
  STUDENT: 30,
  USER: 20,
};

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "管理員",
  STAFF: "職員",
  TUTOR: "導師",
  PARENT: "家長",
  STUDENT: "學員",
  USER: "用戶",
};

export function hasPermission(
  userRole: UserRole | undefined | null,
  permission: Permission
): boolean {
  if (!userRole) return false;
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles.includes(userRole);
}

export function hasAnyPermission(
  userRole: UserRole | undefined | null,
  permissions: Permission[]
): boolean {
  if (!userRole) return false;
  return permissions.some((permission) => hasPermission(userRole, permission));
}

export function hasAllPermissions(
  userRole: UserRole | undefined | null,
  permissions: Permission[]
): boolean {
  if (!userRole) return false;
  return permissions.every((permission) => hasPermission(userRole, permission));
}

export function isRoleAtLeast(
  userRole: UserRole | undefined | null,
  requiredRole: UserRole
): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function isAdmin(role: UserRole | undefined | null): boolean {
  return role === "ADMIN";
}

export function isStaffOrAdmin(role: UserRole | undefined | null): boolean {
  return role === "STAFF" || role === "ADMIN";
}

export function isTutor(role: UserRole | undefined | null): boolean {
  return role === "TUTOR";
}

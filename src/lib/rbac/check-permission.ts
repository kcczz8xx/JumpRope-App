/**
 * Server-side 權限檢查 Helper
 * 用於 API Route 和 Server Actions
 */

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { UserRole } from "./types";
import { hasPermission, isAdmin, type Permission } from "./permissions";
import { prisma } from "@/lib/db";

export interface AuthResult {
  authorized: boolean;
  userId?: string;
  role?: UserRole;
  error?: string;
  status?: number;
}

export async function checkAuth(): Promise<AuthResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      authorized: false,
      error: "請先登入",
      status: 401,
    };
  }

  return {
    authorized: true,
    userId: session.user.id,
    role: session.user.role as UserRole,
  };
}

export async function checkPermission(
  permission: Permission
): Promise<AuthResult> {
  const authResult = await checkAuth();
  if (!authResult.authorized) {
    return authResult;
  }

  if (!hasPermission(authResult.role, permission)) {
    return {
      ...authResult,
      authorized: false,
      error: "權限不足",
      status: 403,
    };
  }

  return authResult;
}

export type OwnershipResourceType =
  | "profile"
  | "child"
  | "document"
  | "address"
  | "bank"
  | "school"
  | "course";

export async function checkOwnership(
  userId: string,
  resourceType: OwnershipResourceType,
  resourceId: string,
  userRole?: UserRole
): Promise<boolean> {
  // ADMIN 和 STAFF 可存取所有 school/course 資源
  if (
    (resourceType === "school" || resourceType === "course") &&
    (userRole === "ADMIN" || userRole === "STAFF")
  ) {
    return true;
  }

  switch (resourceType) {
    case "profile":
    case "address":
    case "bank":
      return userId === resourceId;

    case "child": {
      const child = await prisma.userChild.findUnique({
        where: { id: resourceId },
        select: { parentId: true },
      });
      return child?.parentId === userId;
    }

    case "document": {
      const doc = await prisma.tutorDocument.findUnique({
        where: { id: resourceId },
        include: { tutorProfile: { select: { userId: true } } },
      });
      return doc?.tutorProfile?.userId === userId;
    }

    case "school": {
      // TODO: 當 schema 加入 createdById 後，改為真正的所有權檢查
      const school = await prisma.school.findUnique({
        where: { id: resourceId },
        select: { id: true },
      });
      return !!school;
    }

    case "course": {
      // TODO: 當 schema 加入 createdById 後，改為真正的所有權檢查
      const course = await prisma.schoolCourse.findUnique({
        where: { id: resourceId },
        select: { id: true },
      });
      return !!course;
    }

    default:
      return false;
  }
}

export async function checkPermissionWithOwnership(
  permission: Permission,
  resourceType: OwnershipResourceType,
  resourceId: string
): Promise<AuthResult> {
  const authResult = await checkPermission(permission);
  if (!authResult.authorized) {
    return authResult;
  }

  if (isAdmin(authResult.role)) {
    return authResult;
  }

  const isOwner = await checkOwnership(
    authResult.userId!,
    resourceType,
    resourceId,
    authResult.role
  );

  if (!isOwner) {
    return {
      ...authResult,
      authorized: false,
      error: "只能操作自己的資料",
      status: 403,
    };
  }

  return authResult;
}

export function unauthorizedResponse(message = "請先登入") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = "權限不足") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse<T>(data: T, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    ...(message && { message }),
  });
}

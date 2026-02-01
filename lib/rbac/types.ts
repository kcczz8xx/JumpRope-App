/**
 * RBAC 類型定義
 * 統一角色類型，避免依賴 @prisma/client
 */

export type UserRole = "ADMIN" | "STAFF" | "TUTOR" | "PARENT" | "STUDENT" | "USER";

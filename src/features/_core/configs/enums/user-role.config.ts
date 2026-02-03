/**
 * UserRole Enum Config
 *
 * ⚠️ 變更歷史
 * - 2026-02-03：初始版本
 */

import { UserRole } from "@prisma/client";
import type { EnumConfig } from "./types";

export const USER_ROLE_CONFIG: EnumConfig<UserRole> = {
  values: Object.values(UserRole),
  options: [
    { value: UserRole.ADMIN, label: "管理員", color: "purple" },
    { value: UserRole.STAFF, label: "職員", color: "blue" },
    { value: UserRole.TUTOR, label: "導師", color: "green" },
    { value: UserRole.PARENT, label: "家長", color: "yellow" },
    { value: UserRole.STUDENT, label: "學生", color: "blue" },
    { value: UserRole.USER, label: "用戶", color: "gray" },
  ],
  default: UserRole.USER,
};

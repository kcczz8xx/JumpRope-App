/**
 * CourseStatus Enum Config
 *
 * ⚠️ 變更歷史
 * - 2026-02-03：初始版本（DRAFT, SCHEDULED, ACTIVE, COMPLETED, CANCELLED, SUSPENDED）
 */

import { CourseStatus } from "@prisma/client";
import type { EnumConfig } from "./types";

export const COURSE_STATUS_CONFIG: EnumConfig<CourseStatus> = {
  values: Object.values(CourseStatus),
  options: [
    { value: CourseStatus.DRAFT, label: "草稿", color: "gray" },
    { value: CourseStatus.SCHEDULED, label: "已排程", color: "blue" },
    { value: CourseStatus.ACTIVE, label: "進行中", color: "green" },
    { value: CourseStatus.COMPLETED, label: "已完成", color: "purple" },
    { value: CourseStatus.CANCELLED, label: "已取消", color: "red" },
    { value: CourseStatus.SUSPENDED, label: "已暫停", color: "yellow" },
  ],
  default: CourseStatus.DRAFT,
};

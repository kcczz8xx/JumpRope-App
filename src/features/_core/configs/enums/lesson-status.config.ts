/**
 * LessonStatus Enum Config
 *
 * ⚠️ 變更歷史
 * - 2026-02-03：初始版本（SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, POSTPONED）
 */

import { LessonStatus } from "@prisma/client";
import type { EnumConfig } from "./types";

export const LESSON_STATUS_CONFIG: EnumConfig<LessonStatus> = {
  values: Object.values(LessonStatus),
  options: [
    { value: LessonStatus.SCHEDULED, label: "已排程", color: "blue" },
    { value: LessonStatus.IN_PROGRESS, label: "進行中", color: "green" },
    { value: LessonStatus.COMPLETED, label: "已完成", color: "purple" },
    { value: LessonStatus.CANCELLED, label: "已取消", color: "red" },
    { value: LessonStatus.POSTPONED, label: "已延期", color: "yellow" },
  ],
  default: LessonStatus.SCHEDULED,
};

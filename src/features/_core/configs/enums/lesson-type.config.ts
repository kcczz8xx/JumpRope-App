/**
 * LessonType Enum Config
 *
 * ⚠️ 變更歷史
 * - 2026-02-03：初始版本（REGULAR, MAKEUP, EXTRA_PRACTICE）
 */

import { LessonType } from "@prisma/client";
import type { EnumConfig } from "./types";

export const LESSON_TYPE_CONFIG: EnumConfig<LessonType> = {
  values: Object.values(LessonType),
  options: [
    { value: LessonType.REGULAR, label: "恆常課堂", color: "blue" },
    { value: LessonType.MAKEUP, label: "補堂", color: "yellow" },
    { value: LessonType.EXTRA_PRACTICE, label: "加操", color: "purple" },
  ],
  default: LessonType.REGULAR,
};

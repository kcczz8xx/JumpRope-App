/**
 * CourseTerm Enum Config
 *
 * ⚠️ 變更歷史
 * - 2026-02-03：初始版本（FULL_YEAR, FIRST_TERM, SECOND_TERM, SUMMER）
 */

import { CourseTerm } from "@prisma/client";
import type { EnumConfig } from "./types";

export const COURSE_TERM_CONFIG: EnumConfig<CourseTerm> = {
  values: Object.values(CourseTerm),
  options: [
    { value: CourseTerm.FULL_YEAR, label: "全期", color: "purple" },
    { value: CourseTerm.FIRST_TERM, label: "上學期", color: "blue" },
    { value: CourseTerm.SECOND_TERM, label: "下學期", color: "green" },
    { value: CourseTerm.SUMMER, label: "暑期", color: "yellow" },
  ],
  default: CourseTerm.FULL_YEAR,
};

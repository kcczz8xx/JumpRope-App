/**
 * TutorRole Enum Config
 *
 * ⚠️ 變更歷史
 * - 2026-02-03：初始版本
 */

import { TutorRole } from "@prisma/client";
import type { EnumConfig } from "./types";

export const TUTOR_ROLE_CONFIG: EnumConfig<TutorRole> = {
  values: Object.values(TutorRole),
  options: [
    { value: TutorRole.HEAD_COACH, label: "主教", color: "purple" },
    { value: TutorRole.ASSISTANT_COACH, label: "副教", color: "blue" },
    { value: TutorRole.TEACHING_ASSISTANT, label: "助教", color: "green" },
    { value: TutorRole.SUBSTITUTE, label: "代課", color: "yellow" },
    { value: TutorRole.STAFF, label: "工作人員", color: "gray" },
    { value: TutorRole.NOT_APPLICABLE, label: "不適用", color: "gray" },
  ],
  default: TutorRole.HEAD_COACH,
};

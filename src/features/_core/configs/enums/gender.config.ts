/**
 * Gender Enum Config
 *
 * ⚠️ 變更歷史
 * - 2026-02-03：初始版本
 */

import { Gender } from "@prisma/client";
import type { EnumConfig } from "./types";

export const GENDER_CONFIG: EnumConfig<Gender> = {
  values: Object.values(Gender),
  options: [
    { value: Gender.MALE, label: "男", color: "blue" },
    { value: Gender.FEMALE, label: "女", color: "purple" },
  ],
};

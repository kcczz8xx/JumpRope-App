import { COURSE_TERM_CONFIG } from "@/features/_core/configs/enums";
import { createEnumField } from "../_enum/factory";

/**
 * 課程學期欄位
 *
 * @description 顯示課程學期（上學期/下學期/暑期/全期）
 * @example
 * ```tsx
 * <CourseTermField
 *   value={term}
 *   onChange={setTerm}
 *   label="學期"
 * />
 * ```
 */
export const CourseTermField = createEnumField(
  "CourseTermField",
  COURSE_TERM_CONFIG.options,
  "blue"
);

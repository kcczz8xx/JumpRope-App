import { LESSON_TYPE_CONFIG } from "@/features/_core/configs/enums";
import { createEnumField } from "../_enum/factory";

/**
 * 課堂類型欄位
 *
 * @description 顯示課堂類型（恆常/補堂/加操）
 * @example
 * ```tsx
 * <LessonTypeField
 *   value={type}
 *   onChange={setType}
 *   label="課堂類型"
 * />
 * ```
 */
export const LessonTypeField = createEnumField(
  "LessonTypeField",
  LESSON_TYPE_CONFIG.options,
  "blue"
);

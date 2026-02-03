import { COURSE_STATUS_CONFIG } from "@/features/_core/configs/enums";
import { createEnumField } from "../_enum/factory";

/**
 * 課程狀態欄位
 *
 * @description 顯示課程狀態（草稿 → 進行中 → 已完成）
 * @example
 * ```tsx
 * <CourseStatusField
 *   value={status}
 *   onChange={setStatus}
 *   label="課程狀態"
 * />
 * ```
 */
export const CourseStatusField = createEnumField(
  "CourseStatusField",
  COURSE_STATUS_CONFIG.options,
  COURSE_STATUS_CONFIG.default ? "gray" : "gray"
);

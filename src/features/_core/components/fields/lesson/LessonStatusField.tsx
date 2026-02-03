import { LESSON_STATUS_CONFIG } from "@/features/_core/configs/enums";
import { createEnumField } from "../_enum/factory";

/**
 * 課堂狀態欄位
 *
 * @description 顯示課堂狀態（已排程 → 進行中 → 已完成）
 * @example
 * ```tsx
 * <LessonStatusField
 *   value={status}
 *   onChange={setStatus}
 *   label="課堂狀態"
 * />
 * ```
 */
export const LessonStatusField = createEnumField(
  "LessonStatusField",
  LESSON_STATUS_CONFIG.options,
  "blue"
);

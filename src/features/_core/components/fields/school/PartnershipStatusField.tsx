import { PARTNERSHIP_STATUS_CONFIG } from "@/features/_core/configs/enums";
import { createEnumField } from "../_enum/factory";

/**
 * 合作狀態欄位
 *
 * @description 顯示學校合作狀態（查詢中 → 合作中 → 已終止）
 * @example
 * ```tsx
 * <PartnershipStatusField
 *   value={status}
 *   onChange={setStatus}
 *   label="合作狀態"
 * />
 * ```
 */
export const PartnershipStatusField = createEnumField(
  "PartnershipStatusField",
  PARTNERSHIP_STATUS_CONFIG.options,
  "gray"
);

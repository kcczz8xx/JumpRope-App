import { INVOICE_STATUS_CONFIG } from "@/features/_core/configs/enums";
import { createEnumField } from "../_enum/factory";

/**
 * 發票狀態欄位
 *
 * @description 顯示發票狀態（草稿 → 已發送 → 已付款）
 * @example
 * ```tsx
 * <InvoiceStatusField
 *   value={status}
 *   onChange={setStatus}
 *   label="發票狀態"
 * />
 * ```
 */
export const InvoiceStatusField = createEnumField(
  "InvoiceStatusField",
  INVOICE_STATUS_CONFIG.options,
  "gray"
);

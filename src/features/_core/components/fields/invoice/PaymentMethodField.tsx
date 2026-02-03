import { PAYMENT_METHOD_CONFIG } from "@/features/_core/configs/enums";
import { createEnumField } from "../_enum/factory";

/**
 * 付款方式欄位
 *
 * @description 顯示付款方式（現金/支票/銀行轉帳/FPS 等）
 * @example
 * ```tsx
 * <PaymentMethodField
 *   value={method}
 *   onChange={setMethod}
 *   label="付款方式"
 * />
 * ```
 */
export const PaymentMethodField = createEnumField(
  "PaymentMethodField",
  PAYMENT_METHOD_CONFIG.options,
  "blue"
);

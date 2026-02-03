/**
 * PaymentStatus Enum Config
 *
 * ⚠️ 變更歷史
 * - 2026-02-03：初始版本
 */

import { PaymentStatus } from "@prisma/client";
import type { EnumConfig } from "./types";

export const PAYMENT_STATUS_CONFIG: EnumConfig<PaymentStatus> = {
  values: Object.values(PaymentStatus),
  options: [
    { value: PaymentStatus.PENDING, label: "待付款", color: "yellow" },
    { value: PaymentStatus.PARTIAL, label: "部分付款", color: "blue" },
    { value: PaymentStatus.PAID, label: "已付款", color: "green" },
    { value: PaymentStatus.REFUNDED, label: "已退款", color: "red" },
  ],
  default: PaymentStatus.PENDING,
};

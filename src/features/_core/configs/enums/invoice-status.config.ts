/**
 * InvoiceStatus Enum Config
 *
 * ⚠️ 變更歷史
 * - 2026-02-03：初始版本
 */

import { InvoiceStatus } from "@prisma/client";
import type { EnumConfig } from "./types";

export const INVOICE_STATUS_CONFIG: EnumConfig<InvoiceStatus> = {
  values: Object.values(InvoiceStatus),
  options: [
    { value: InvoiceStatus.DRAFT, label: "草稿", color: "gray" },
    { value: InvoiceStatus.PENDING_APPROVAL, label: "待審核", color: "yellow" },
    { value: InvoiceStatus.PENDING_SEND, label: "待發送", color: "blue" },
    { value: InvoiceStatus.SENT, label: "已發送", color: "blue" },
    { value: InvoiceStatus.OVERDUE, label: "已逾期", color: "red" },
    { value: InvoiceStatus.PAID, label: "已付款", color: "green" },
    { value: InvoiceStatus.CANCELLED, label: "已取消", color: "gray" },
    { value: InvoiceStatus.VOID, label: "作廢", color: "red" },
  ],
  default: InvoiceStatus.DRAFT,
};

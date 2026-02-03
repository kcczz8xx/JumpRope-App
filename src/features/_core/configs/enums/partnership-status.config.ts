/**
 * PartnershipStatus Enum Config
 *
 * ⚠️ 變更歷史
 * - 2026-02-03：初始版本
 */

import { PartnershipStatus } from "@prisma/client";
import type { EnumConfig } from "./types";

export const PARTNERSHIP_STATUS_CONFIG: EnumConfig<PartnershipStatus> = {
  values: Object.values(PartnershipStatus),
  options: [
    { value: PartnershipStatus.INQUIRY, label: "查詢中", color: "gray" },
    { value: PartnershipStatus.QUOTATION_SENT, label: "已發送報價", color: "blue" },
    { value: PartnershipStatus.NEGOTIATING, label: "洽談中", color: "yellow" },
    { value: PartnershipStatus.CONFIRMED, label: "已確認合作", color: "purple" },
    { value: PartnershipStatus.ACTIVE, label: "合作中", color: "green" },
    { value: PartnershipStatus.SUSPENDED, label: "暫停合作", color: "yellow" },
    { value: PartnershipStatus.TERMINATED, label: "已終止", color: "red" },
  ],
  default: PartnershipStatus.INQUIRY,
};

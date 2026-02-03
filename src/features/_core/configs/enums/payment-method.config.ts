/**
 * PaymentMethod Enum Config
 *
 * ⚠️ 變更歷史
 * - 2026-02-03：初始版本
 */

import { PaymentMethod } from "@prisma/client";
import type { EnumConfig } from "./types";

export const PAYMENT_METHOD_CONFIG: EnumConfig<PaymentMethod> = {
  values: Object.values(PaymentMethod),
  options: [
    { value: PaymentMethod.CASH, label: "現金", color: "green" },
    { value: PaymentMethod.CHEQUE, label: "支票", color: "blue" },
    { value: PaymentMethod.BANK_TRANSFER, label: "銀行轉帳", color: "blue" },
    { value: PaymentMethod.FPS, label: "轉數快", color: "purple" },
    { value: PaymentMethod.PAYME, label: "PayMe", color: "red" },
    { value: PaymentMethod.ALIPAY_HK, label: "支付寶香港", color: "blue" },
    { value: PaymentMethod.WECHAT_PAY_HK, label: "微信支付香港", color: "green" },
    { value: PaymentMethod.CREDIT_CARD, label: "信用卡", color: "yellow" },
    { value: PaymentMethod.AUTOPAY, label: "自動轉帳", color: "purple" },
    { value: PaymentMethod.OTHER, label: "其他", color: "gray" },
  ],
  default: PaymentMethod.BANK_TRANSFER,
};

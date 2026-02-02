/**
 * 外部服務相關錯誤碼 (EXTERNAL)
 */

export const EXTERNAL_ERRORS = {
  SMS_FAILED: {
    code: "EXT_001",
    status: 503,
    i18n: "errors.external.sms_failed",
    message: "簡訊服務暫時無法使用",
  },
  PAYMENT_FAILED: {
    code: "EXT_002",
    status: 503,
    i18n: "errors.external.payment_failed",
    message: "付款服務暫時無法使用",
  },
  EMAIL_FAILED: {
    code: "EXT_003",
    status: 503,
    i18n: "errors.external.email_failed",
    message: "郵件服務暫時無法使用",
  },
} as const;

/**
 * OTP 相關錯誤碼 (OTP)
 */

export const OTP_ERRORS = {
  EXPIRED: {
    code: "OTP_001",
    status: 400,
    i18n: "errors.otp.expired",
    message: "驗證碼已過期",
  },
  INVALID: {
    code: "OTP_002",
    status: 400,
    i18n: "errors.otp.invalid",
    message: "驗證碼錯誤",
  },
  MAX_ATTEMPTS: {
    code: "OTP_003",
    status: 429,
    i18n: "errors.otp.max_attempts",
    message: "驗證次數超過限制",
  },
  SEND_FAILED: {
    code: "OTP_004",
    status: 503,
    i18n: "errors.otp.send_failed",
    message: "驗證碼發送失敗",
  },
  ALREADY_SENT: {
    code: "OTP_005",
    status: 429,
    i18n: "errors.otp.already_sent",
    message: "驗證碼已發送，請稍後再試",
  },
  NOT_FOUND: {
    code: "OTP_006",
    status: 404,
    i18n: "errors.otp.not_found",
    message: "驗證碼不存在，請重新發送",
  },
} as const;

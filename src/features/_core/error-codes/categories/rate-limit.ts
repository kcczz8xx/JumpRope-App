/**
 * 速率限制相關錯誤碼 (RATE_LIMIT)
 */

export const RATE_LIMIT_ERRORS = {
  EXCEEDED: {
    code: "RATE_001",
    status: 429,
    i18n: "errors.rate_limit.exceeded",
    message: "請求過於頻繁，請稍後再試",
  },
  OTP_SEND: {
    code: "RATE_002",
    status: 429,
    i18n: "errors.rate_limit.otp_send",
    message: "驗證碼發送次數過多，請稍後再試",
  },
} as const;

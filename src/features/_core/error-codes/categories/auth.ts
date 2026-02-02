/**
 * 認證相關錯誤碼 (AUTH)
 */

export const AUTH_ERRORS = {
  PHONE_REGISTERED: {
    code: "AUTH_001",
    status: 409,
    i18n: "errors.auth.phone_registered",
    message: "此手機號碼已註冊",
  },
  INVALID_CREDENTIALS: {
    code: "AUTH_002",
    status: 401,
    i18n: "errors.auth.invalid_credentials",
    message: "帳號或密碼錯誤",
  },
  SESSION_EXPIRED: {
    code: "AUTH_003",
    status: 401,
    i18n: "errors.auth.session_expired",
    message: "登入已過期，請重新登入",
  },
  NOT_VERIFIED: {
    code: "AUTH_004",
    status: 403,
    i18n: "errors.auth.not_verified",
    message: "帳號尚未驗證",
  },
  ACCOUNT_LOCKED: {
    code: "AUTH_005",
    status: 423,
    i18n: "errors.auth.account_locked",
    message: "帳號已被鎖定",
  },
  EMAIL_REGISTERED: {
    code: "AUTH_006",
    status: 409,
    i18n: "errors.auth.email_registered",
    message: "此電郵地址已註冊",
  },
  PHONE_NOT_VERIFIED: {
    code: "AUTH_007",
    status: 403,
    i18n: "errors.auth.phone_not_verified",
    message: "請先完成電話號碼驗證",
  },
  INVALID_PASSWORD: {
    code: "AUTH_008",
    status: 401,
    i18n: "errors.auth.invalid_password",
    message: "密碼不正確",
  },
  INVALID_RESET_TOKEN: {
    code: "AUTH_009",
    status: 400,
    i18n: "errors.auth.invalid_reset_token",
    message: "重設令牌無效",
  },
  RESET_TOKEN_EXPIRED: {
    code: "AUTH_010",
    status: 400,
    i18n: "errors.auth.reset_token_expired",
    message: "重設令牌已過期，請重新驗證",
  },
  EMAIL_NOT_VERIFIED: {
    code: "AUTH_011",
    status: 403,
    i18n: "errors.auth.email_not_verified",
    message: "請先完成電郵地址驗證",
  },
  PHONE_IN_USE: {
    code: "AUTH_012",
    status: 409,
    i18n: "errors.auth.phone_in_use",
    message: "此電話號碼已被使用",
  },
  EMAIL_IN_USE: {
    code: "AUTH_013",
    status: 409,
    i18n: "errors.auth.email_in_use",
    message: "此電郵地址已被使用",
  },
} as const;

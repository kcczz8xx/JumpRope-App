/**
 * 統一錯誤碼系統
 *
 * 設計原則：
 * 1. 單一真實來源
 * 2. 編譯期型別檢查
 * 3. 自動 HTTP 狀態碼映射
 * 4. i18n 支持
 */

export interface ErrorDefinition {
  code: string;
  status: number;
  i18n: string;
  message: string;
}

export const ERROR_CODES = {
  // ===== 認證相關 =====
  AUTH: {
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
  },

  // ===== OTP 相關 =====
  OTP: {
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
  },

  // ===== 驗證相關 =====
  VALIDATION: {
    INVALID_INPUT: {
      code: "VAL_001",
      status: 400,
      i18n: "errors.validation.invalid_input",
      message: "輸入資料格式錯誤",
    },
    MISSING_FIELD: {
      code: "VAL_002",
      status: 400,
      i18n: "errors.validation.missing_field",
      message: "缺少必要欄位",
    },
    INVALID_FORMAT: {
      code: "VAL_003",
      status: 400,
      i18n: "errors.validation.invalid_format",
      message: "資料格式不正確",
    },
    INVALID_PHONE: {
      code: "VAL_004",
      status: 400,
      i18n: "errors.validation.invalid_phone",
      message: "手機號碼格式不正確",
    },
    INVALID_EMAIL: {
      code: "VAL_005",
      status: 400,
      i18n: "errors.validation.invalid_email",
      message: "電子郵件格式不正確",
    },
    MISSING_EMAIL: {
      code: "VAL_006",
      status: 400,
      i18n: "errors.validation.missing_email",
      message: "請提供電郵地址",
    },
    EMAIL_RESET_NOT_AVAILABLE: {
      code: "VAL_007",
      status: 400,
      i18n: "errors.validation.email_reset_not_available",
      message: "電郵重設功能尚未開放，請使用電話號碼重設密碼",
    },
    PHONE_REQUIRED: {
      code: "VAL_008",
      status: 400,
      i18n: "errors.validation.phone_required",
      message: "電話號碼不能為空",
    },
    NO_UPDATE_DATA: {
      code: "VAL_009",
      status: 400,
      i18n: "errors.validation.no_update_data",
      message: "沒有要更新的資料",
    },
    FILE_TOO_LARGE: {
      code: "VAL_010",
      status: 400,
      i18n: "errors.validation.file_too_large",
      message: "文件大小超過限制",
    },
  },

  // ===== 權限相關 =====
  PERMISSION: {
    UNAUTHORIZED: {
      code: "PERM_001",
      status: 401,
      i18n: "errors.permission.unauthorized",
      message: "請先登入",
    },
    FORBIDDEN: {
      code: "PERM_002",
      status: 403,
      i18n: "errors.permission.forbidden",
      message: "您沒有執行此操作的權限",
    },
    NOT_OWNER: {
      code: "PERM_003",
      status: 403,
      i18n: "errors.permission.not_owner",
      message: "您不是此資源的擁有者",
    },
    ROLE_REQUIRED: {
      code: "PERM_004",
      status: 403,
      i18n: "errors.permission.role_required",
      message: "需要特定角色才能執行此操作",
    },
  },

  // ===== 速率限制 =====
  RATE_LIMIT: {
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
  },

  // ===== 資源相關 =====
  RESOURCE: {
    NOT_FOUND: {
      code: "RES_001",
      status: 404,
      i18n: "errors.resource.not_found",
      message: "找不到指定的資源",
    },
    ALREADY_EXISTS: {
      code: "RES_002",
      status: 409,
      i18n: "errors.resource.already_exists",
      message: "資源已存在",
    },
    CONFLICT: {
      code: "RES_003",
      status: 409,
      i18n: "errors.resource.conflict",
      message: "資源狀態衝突",
    },
    DELETED: {
      code: "RES_004",
      status: 410,
      i18n: "errors.resource.deleted",
      message: "資源已被刪除",
    },
  },

  // ===== 資料庫相關 =====
  DATABASE: {
    CONNECTION_FAILED: {
      code: "DB_001",
      status: 503,
      i18n: "errors.database.connection_failed",
      message: "資料庫連線失敗",
    },
    QUERY_FAILED: {
      code: "DB_002",
      status: 500,
      i18n: "errors.database.query_failed",
      message: "資料庫查詢失敗",
    },
    TRANSACTION_FAILED: {
      code: "DB_003",
      status: 500,
      i18n: "errors.database.transaction_failed",
      message: "資料庫交易失敗",
    },
  },

  // ===== 外部服務相關 =====
  EXTERNAL: {
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
  },

  // ===== 業務邏輯相關 =====
  BUSINESS: {
    SCHOOL_HAS_COURSES: {
      code: "BIZ_001",
      status: 409,
      i18n: "errors.business.school_has_courses",
      message: "學校仍有課程，無法刪除",
    },
    COURSE_HAS_STUDENTS: {
      code: "BIZ_002",
      status: 409,
      i18n: "errors.business.course_has_students",
      message: "課程仍有學生，無法刪除",
    },
    ENROLLMENT_CLOSED: {
      code: "BIZ_003",
      status: 400,
      i18n: "errors.business.enrollment_closed",
      message: "報名已截止",
    },
  },
} as const;

// ===== 型別推導 =====

export type ErrorCategory = keyof typeof ERROR_CODES;

export type ErrorCode<T extends ErrorCategory> = keyof (typeof ERROR_CODES)[T];

export type AnyErrorCode = {
  [K in ErrorCategory]: `${K}.${string & ErrorCode<K>}`;
}[ErrorCategory];

// ===== 輔助函式 =====

/**
 * 獲取錯誤定義
 */
export function getError<T extends ErrorCategory>(
  category: T,
  code: ErrorCode<T>
): ErrorDefinition {
  return ERROR_CODES[category][code] as ErrorDefinition;
}

/**
 * 創建錯誤回應
 */
export function createErrorResponse<T extends ErrorCategory>(
  category: T,
  code: ErrorCode<T>,
  details?: Record<string, unknown>
) {
  const error = getError(category, code);
  return {
    success: false as const,
    error: {
      code: error.code,
      message: error.message,
      i18n: error.i18n,
      details,
    },
    status: error.status,
  };
}

/**
 * 檢查是否為特定錯誤
 */
export function isError<T extends ErrorCategory>(
  response: { error?: { code?: string } },
  category: T,
  code: ErrorCode<T>
): boolean {
  const error = getError(category, code);
  return response.error?.code === error.code;
}

/**
 * 創建失敗回應（用於 Server Action handler）
 *
 * 這是 createErrorResponse 的簡化版本，返回符合 ActionResult 的格式
 *
 * @example
 * return failureFromCode("RATE_LIMIT", "EXCEEDED");
 * return failureFromCode("AUTH", "PHONE_REGISTERED");
 */
export function failureFromCode<T extends ErrorCategory>(
  category: T,
  code: ErrorCode<T>,
  details?: Record<string, unknown>
): { success: false; error: { code: string; message: string; i18n: string; details?: Record<string, unknown> } } {
  const error = getError(category, code);
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      i18n: error.i18n,
      details,
    },
  };
}

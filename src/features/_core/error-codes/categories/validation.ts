/**
 * 驗證相關錯誤碼 (VALIDATION)
 */

export const VALIDATION_ERRORS = {
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
} as const;

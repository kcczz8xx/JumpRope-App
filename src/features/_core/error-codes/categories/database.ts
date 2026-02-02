/**
 * 資料庫相關錯誤碼 (DATABASE)
 */

export const DATABASE_ERRORS = {
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
} as const;

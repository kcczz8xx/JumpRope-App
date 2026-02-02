/**
 * 資源相關錯誤碼 (RESOURCE)
 */

export const RESOURCE_ERRORS = {
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
} as const;

/**
 * 權限相關錯誤碼 (PERMISSION)
 */

export const PERMISSION_ERRORS = {
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
} as const;

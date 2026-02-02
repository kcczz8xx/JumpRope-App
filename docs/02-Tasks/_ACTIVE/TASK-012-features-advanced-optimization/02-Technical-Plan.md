# TASK-012 Features 架構進階優化 - 技術方案

## 架構概覽

```
src/
├── features/
│   ├── _core/                    # 🆕 Feature 內核模組
│   │   ├── error-codes.ts        # 統一錯誤碼
│   │   ├── permission.ts         # 權限驗證
│   │   ├── audit.ts              # 審計日誌
│   │   ├── constants.ts          # 共用常數
│   │   └── index.ts
│   ├── auth/
│   ├── school-service/
│   └── user/
└── lib/
    └── patterns/                 # 🆕 通用模式
        ├── server-action.ts      # Action Wrapper
        ├── types.ts              # 共用型別
        └── index.ts
```

---

## 方案 1：統一錯誤碼系統

### 設計目標

- 單一真實來源（Single Source of Truth）
- 編譯期型別檢查
- 自動 HTTP 狀態碼映射
- i18n 支持

### 檔案結構

```typescript
// src/features/_core/error-codes.ts

export const ERROR_CODES = {
  // 認證相關
  AUTH: {
    PHONE_REGISTERED: {
      code: "AUTH_001",
      status: 409,
      i18n: "errors.auth.phone_registered",
    },
    INVALID_CREDENTIALS: {
      code: "AUTH_002",
      status: 401,
      i18n: "errors.auth.invalid_credentials",
    },
    SESSION_EXPIRED: {
      code: "AUTH_003",
      status: 401,
      i18n: "errors.auth.session_expired",
    },
  },

  // OTP 相關
  OTP: {
    EXPIRED: {
      code: "OTP_001",
      status: 400,
      i18n: "errors.otp.expired",
    },
    INVALID: {
      code: "OTP_002",
      status: 400,
      i18n: "errors.otp.invalid",
    },
    MAX_ATTEMPTS: {
      code: "OTP_003",
      status: 429,
      i18n: "errors.otp.max_attempts",
    },
  },

  // 驗證相關
  VALIDATION: {
    INVALID_INPUT: {
      code: "VAL_001",
      status: 400,
      i18n: "errors.validation.invalid_input",
    },
    MISSING_FIELD: {
      code: "VAL_002",
      status: 400,
      i18n: "errors.validation.missing_field",
    },
  },

  // 權限相關
  PERMISSION: {
    UNAUTHORIZED: {
      code: "PERM_001",
      status: 401,
      i18n: "errors.permission.unauthorized",
    },
    FORBIDDEN: {
      code: "PERM_002",
      status: 403,
      i18n: "errors.permission.forbidden",
    },
    NOT_OWNER: {
      code: "PERM_003",
      status: 403,
      i18n: "errors.permission.not_owner",
    },
  },

  // 速率限制
  RATE_LIMIT: {
    EXCEEDED: {
      code: "RATE_001",
      status: 429,
      i18n: "errors.rate_limit.exceeded",
    },
  },

  // 資源相關
  RESOURCE: {
    NOT_FOUND: {
      code: "RES_001",
      status: 404,
      i18n: "errors.resource.not_found",
    },
    ALREADY_EXISTS: {
      code: "RES_002",
      status: 409,
      i18n: "errors.resource.already_exists",
    },
  },
} as const;

// 型別推導
export type ErrorCategory = keyof typeof ERROR_CODES;
export type ErrorCode<T extends ErrorCategory> = keyof (typeof ERROR_CODES)[T];
```

---

## 方案 2：Server Action Wrapper

### 設計目標

- 自動處理認證檢查
- 自動處理權限驗證
- 自動處理速率限制
- 自動審計日誌
- 統一錯誤處理

### API 設計

```typescript
// src/lib/patterns/server-action.ts

interface ActionOptions<TInput> {
  // 認證
  requireAuth?: boolean;
  
  // 權限
  requiredRole?: Role | Role[];
  ownershipCheck?: (input: TInput, userId: string) => Promise<boolean>;
  
  // 速率限制
  rateLimitKey?: string | ((input: TInput) => string);
  rateLimitConfig?: {
    max: number;
    window: number; // seconds
  };
  
  // 審計
  audit?: boolean;
  auditAction?: string;
}

export function createAction<TInput, TOutput>(
  handler: (input: TInput, ctx: ActionContext) => Promise<ActionResult<TOutput>>,
  options?: ActionOptions<TInput>
): (input: TInput) => Promise<ActionResult<TOutput>>;
```

### 使用範例

```typescript
// src/features/auth/actions/otp.ts

export const sendOtpAction = createAction(
  async (input, ctx) => {
    // 核心邏輯 - 認證、權限、速率限制已自動處理
    const otp = generateOtp();
    await saveOtp(input.phone, otp);
    await sendSms(input.phone, otp);
    
    return success({ sent: true });
  },
  {
    requireAuth: false,
    rateLimitKey: (input) => `otp:send:${input.phone}`,
    rateLimitConfig: { max: 5, window: 3600 },
    audit: true,
    auditAction: "OTP_SEND",
  }
);
```

---

## 方案 3：Feature 內核模組

### `_core/permission.ts`

```typescript
// RBAC + 所有權檢查

export async function checkPermission(
  userId: string,
  resource: string,
  action: "read" | "write" | "delete",
  resourceId?: string
): Promise<boolean>;

export async function checkOwnership(
  userId: string,
  resource: string,
  resourceId: string
): Promise<boolean>;
```

### `_core/audit.ts`

```typescript
// 審計日誌

export async function logAudit(entry: {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  input?: unknown;
  result: "success" | "failure";
  errorCode?: string;
  metadata?: Record<string, unknown>;
}): Promise<void>;
```

### Prisma Schema 更新

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  action     String
  resource   String
  resourceId String?
  input      Json?
  result     String   // "success" | "failure"
  errorCode  String?
  metadata   Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())

  user       User?    @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([action])
  @@index([resource])
  @@index([createdAt])
}
```

---

## 實施順序

### Phase 1（Week 1-2）

1. 建立 `src/features/_core/` 目錄
2. 實現 `error-codes.ts`
3. 實現 `permission.ts`
4. 實現 `audit.ts`
5. 建立 `src/lib/patterns/server-action.ts`
6. 更新 Prisma schema + migration

### Phase 2（Week 3-4）

1. 遷移 `auth/actions/otp.ts`
2. 遷移 `auth/actions/register.ts`
3. 遷移 `auth/actions/password.ts`
4. 遷移 `school-service/actions/school.ts`
5. 遷移 `school-service/actions/course.ts`
6. 遷移 `school-service/actions/batch.ts`

### Phase 3（Week 5）

1. 更新 `STRUCTURE.md`
2. 更新 `create-feature.js`
3. 建立遷移指南
4. 內部培訓

---

## 向後兼容策略

- Action Wrapper 是 **opt-in**，現有 actions 不強制遷移
- 錯誤碼系統可與現有 `failure()` 並存
- 審計日誌是可選功能

## 測試策略

- 每個 `_core` 模組需要單元測試
- Action Wrapper 需要整合測試
- 遷移後的 actions 需要回歸測試

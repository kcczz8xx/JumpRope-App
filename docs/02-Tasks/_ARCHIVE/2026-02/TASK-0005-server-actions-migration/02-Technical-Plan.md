# Server Actions 遷移技術方案

## 現況分析

### 依賴版本

| 套件 | 版本 | 狀態 |
|:-----|:-----|:-----|
| Next.js | ^15.5.11 | ✅ 完全支援 |
| React | ^19.1.1 | ✅ 原生支援 |
| Prisma | ^7.3.0 | ✅ |
| NextAuth | 5.0.0-beta.30 | ✅ |
| Zod | ^4.3.6 | ✅ |
| @upstash/ratelimit | ^2.0.5 | ✅ 已配置 |

### 現有可重用基礎設施

| 路徑 | 用途 |
|:-----|:-----|
| `src/lib/server/rate-limit.ts` | Rate limit |
| `src/lib/rbac/check-permission.ts` | 權限檢查 |
| `src/lib/services/` | Service 層 |
| `src/lib/validations/` | Zod schemas |
| `src/lib/db/` | Prisma client |

### Client 調用點（需更新）

| 檔案 | fetch 次數 |
|:-----|:-----------|
| `features/auth/components/SignUpForm.tsx` | 4 |
| `features/auth/components/ResetPasswordForm.tsx` | 4 |
| `features/user/components/profile/UserInfoEditModal.tsx` | 2 |
| `features/user/components/profile/UserTutorCard.tsx` | 1 |
| `features/school-service/components/course/NewCourseForm.tsx` | 1 |
| `features/school-service/components/course/SchoolFormStep.tsx` | 1 |
| `app/(private)/dashboard/school/courses/new/page.tsx` | 1 |

---

## 目標架構

```
src/
├── lib/
│   ├── actions/                 # 🆕 Action 基礎設施
│   │   ├── index.ts
│   │   ├── types.ts             # ActionResult, ActionErrorCode
│   │   ├── safe-action.ts       # safeAction wrapper
│   │   └── guards.ts            # requireUser, requirePermission
│   └── ...（已有）
│
└── features/
    ├── auth/
    │   ├── actions.ts           # 🆕
    │   ├── schema.ts            # 🆕
    │   └── ...
    ├── user/
    │   ├── actions.ts           # 🆕
    │   ├── queries.ts           # 🆕
    │   ├── schema.ts            # 🆕（參照 lib/validations/user.ts）
    │   └── ...
    └── school-service/
        ├── actions.ts           # 🆕
        ├── queries.ts           # 🆕
        ├── schema.ts            # 🆕
        └── ...
```

---

## 設計決策

### 1. 統一回傳格式

```typescript
// src/lib/actions/types.ts
export type ActionErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ActionErrorCode; message: string; fieldErrors?: Record<string, string[]> } };
```

### 2. safeAction Wrapper

自動處理：
- Zod 驗證
- 錯誤轉換
- 日誌記錄

```typescript
export function safeAction<TSchema extends ZodTypeAny, TOut>(
  schema: TSchema,
  handler: (input: z.infer<TSchema>) => Promise<ActionResult<TOut>>
) {
  return async (rawInput: unknown): Promise<ActionResult<TOut>> => {
    // 驗證 + 執行 + 錯誤處理
  };
}
```

### 3. Guards

```typescript
// requireUser() - 需要登入
// requirePermission(permission) - 需要特定權限
```

---

## 實施步驟

### 階段一：基礎設施（1-2h）

1. 建立 `src/lib/actions/types.ts`
2. 建立 `src/lib/actions/safe-action.ts`
3. 建立 `src/lib/actions/guards.ts`
4. 建立 `src/lib/actions/index.ts`

### 階段二：Auth 模組（2-3h）

1. 建立 `src/features/auth/schema.ts`
2. 建立 `src/features/auth/actions.ts`
   - `sendOtpAction`
   - `verifyOtpAction`
   - `registerAction`
   - `resetPasswordSendAction`
   - `resetPasswordVerifyAction`
   - `resetPasswordAction`
   - `changePasswordAction`
3. 更新 `SignUpForm.tsx`
4. 更新 `ResetPasswordForm.tsx`
5. 更新 `src/features/auth/index.ts`

### 階段三：User 模組（2-3h）

1. 建立 `src/features/user/schema.ts`
2. 建立 `src/features/user/queries.ts`
   - `getProfile`
   - `getAddress`
   - `getBank`
   - `getChildren`
3. 建立 `src/features/user/actions.ts`
   - `updateProfileAction`
   - `updateAddressAction`
   - `updateBankAction`
   - `createChildAction`
   - `updateChildAction`
   - `deleteChildAction`
   - `uploadTutorDocumentAction`
4. 更新相關 components
5. 更新 `src/features/user/index.ts`

### 階段四：School Service 模組（2-3h）

1. 建立 `src/features/school-service/schema.ts`
2. 建立 `src/features/school-service/queries.ts`
   - `getCourses`
   - `getSchools`
   - `getSchoolById`
3. 建立 `src/features/school-service/actions.ts`
   - `createCourseAction`
   - `updateCourseAction`
   - `createSchoolAction`
   - `updateSchoolAction`
4. 更新相關 components
5. 更新 `src/features/school-service/index.ts`

### 階段五：收尾（1-2h）

1. 標記/刪除廢棄的 API Routes
2. 更新文檔
3. 執行驗證：`pnpm lint && pnpm type-check && pnpm build`

---

## 風險與緩解

| 風險 | 緩解措施 |
|:-----|:---------|
| 遺漏 API 調用點 | grep 搜索確認 |
| Rate limit 失效 | 保持與 API Route 相同配置 |
| 權限檢查遺漏 | 複製現有 checkPermission 邏輯 |
| 回滾困難 | 分階段遷移，每階段可獨立運作 |

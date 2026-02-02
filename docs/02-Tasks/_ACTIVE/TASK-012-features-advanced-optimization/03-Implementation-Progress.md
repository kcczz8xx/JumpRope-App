# TASK-012 實施進度

**狀態**：✅ Phase 1-4 完成

---

## Phase 1：基礎設施

- [x] 建立 `src/features/_core/` 目錄結構
- [x] 實現 `error-codes.ts` — 統一錯誤碼系統
- [x] 實現 `permission.ts` — RBAC 權限驗證（已整合調用 lib/rbac）
- [x] 實現 `audit.ts` — 審計日誌
- [x] 實現 `constants.ts` — 共用常數
- [x] 實現 `index.ts` — 公開 API
- [x] 建立 `src/lib/patterns/types.ts`
- [x] 建立 `src/lib/patterns/server-action.ts`
- [x] 建立 `src/lib/patterns/index.ts`
- [x] 更新 Prisma schema（AuditLog, RateLimitLog）
- [x] 整合權限模組（消除 `_core/permission.ts` 與 `lib/rbac/permissions.ts` 重複）
- [x] 整合 `checkOwnership`（統一到 `lib/rbac/check-permission.ts`）
- [x] 執行 migration（`20260202161713_add_audit_and_rate_limit`）
- [x] 驗證 build 通過 ✅

## Phase 2.0：統一 ActionResult 格式

- [x] 修改 `lib/actions/types.ts`（`ok` → `success`）
- [x] 更新 `lib/actions/guards.ts`
- [x] 更新 `hooks/useUserActions.ts`
- [x] 更新 `features/auth/` (3 files)
- [x] 更新 `features/user/` (12 files)
- [x] 更新 `features/school-service/` (7 files)
- [x] 更新 `app/dashboard/school/courses/new/page.tsx`
- [x] 驗證 build 通過 ✅

## Phase 2.1-2.3：遷移 Auth Actions

- [x] `actions/otp.ts` — `sendOtpAction`, `verifyOtpAction`
- [x] `actions/register.ts` — `registerAction`
- [x] `actions/password.ts` — 4 個 actions
- [x] 驗證 build 通過 ✅

## Phase 2.4-2.6：遷移 School-Service Actions

- [x] `actions/school.ts` — `createSchoolAction`, `updateSchoolAction`, `deleteSchoolAction`
- [x] `actions/course.ts` — `createCourseAction`, `deleteCourseAction`
- [x] `actions/batch.ts` — `batchCreateWithSchoolAction`
- [x] 修復 schema 類型（`startDate`, `courseDescription` 加入 `nullable()`）
- [x] 驗證 build 通過 ✅

## Phase 3：文檔

- [x] 更新 `STRUCTURE.md`（加入 createAction wrapper 說明）
- [x] 更新 `create-feature.js`（加入 \_template.ts 範例）
- [x] 建立遷移指南（safeAction → createAction）

## Phase 4：遷移 User Actions（額外完成）

- [x] `actions/profile.ts` — `updateProfileAction`
- [x] `actions/address.ts` — `updateAddressAction`, `deleteAddressAction`
- [x] `actions/bank.ts` — `updateBankAction`, `deleteBankAction`
- [x] `actions/children.ts` — `createChildAction`, `updateChildAction`, `deleteChildAction`
- [ ] `actions/documents.ts` — 使用 FormData，保留原模式
- [x] 驗證 build 通過 ✅

---

## Phase 5：Code Review 修正（2026-02-03）

根據 Code Review 報告執行的修正：

### 5.1 ActionContext 補充 ipAddress/userAgent ✅

- 修改 `lib/patterns/types.ts`：新增 `ipAddress` 和 `userAgent` 欄位
- 修改 `lib/patterns/server-action.ts`：從 headers 取得並傳入 ctx
- 修改 `features/_core/audit.ts`：`AuditEntry` 補充可選欄位，`logAudit` 優先使用傳入值

### 5.2 統一錯誤碼遷移 ✅

**新增錯誤碼**（共 8 個）：

- `AUTH`: `EMAIL_REGISTERED`, `PHONE_NOT_VERIFIED`, `INVALID_PASSWORD`, `INVALID_RESET_TOKEN`, `RESET_TOKEN_EXPIRED`, `EMAIL_NOT_VERIFIED`, `PHONE_IN_USE`, `EMAIL_IN_USE`
- `OTP`: `NOT_FOUND`
- `VALIDATION`: `MISSING_EMAIL`, `EMAIL_RESET_NOT_AVAILABLE`, `PHONE_REQUIRED`, `NO_UPDATE_DATA`

**遷移統計**（共 53 處）：

| Feature        | 檔案                  | 數量 |
| -------------- | --------------------- | ---- |
| auth           | `actions/otp.ts`      | 8    |
| auth           | `actions/register.ts` | 4    |
| auth           | `actions/password.ts` | 12   |
| user           | `actions/profile.ts`  | 7    |
| user           | `actions/children.ts` | 6    |
| user           | `actions/address.ts`  | 3    |
| user           | `actions/bank.ts`     | 3    |
| school-service | `actions/school.ts`   | 5    |
| school-service | `actions/course.ts`   | 4    |
| school-service | `actions/batch.ts`    | 1    |

### 5.3 Prisma AuditLog relation ✅

確認已存在（無需修改）

### 5.4 Queries 遷移到 createAction ✅

將使用舊系統的 queries 完整遷移：

| 檔案                               | 舊函式名                      | 新函式名                                  |
| ---------------------------------- | ----------------------------- | ----------------------------------------- |
| `user/queries/profile.ts`          | `getProfile`                  | `getProfileAction`                        |
| `school-service/queries/course.ts` | `getCourses`, `getCourseById` | `getCoursesAction`, `getCourseByIdAction` |
| `school-service/queries/school.ts` | `getSchools`, `getSchoolById` | `getSchoolsAction`, `getSchoolByIdAction` |
| `user/actions/documents.ts`        | —                             | 使用 `failureFromCode`（10 處）           |

**同步更新的引用**：

- `features/*/index.ts`、`server.ts`、`queries/index.ts`
- `app/(private)/dashboard/school/courses/new/page.tsx`
- `features/school-service/components/course/SchoolFormStep.tsx`

**新增錯誤碼**：`VALIDATION.FILE_TOO_LARGE`

### 5.5 Error-Codes 模組化拆分 ✅

將 424 行的 `error-codes.ts` 拆分為模組化結構：

```
src/features/_core/error-codes/
├── index.ts           ← 統一導出（向後兼容）
├── types.ts           ← ErrorDefinition 介面
└── categories/
    ├── auth.ts        (13 codes)
    ├── otp.ts         (6)
    ├── validation.ts  (10)
    ├── permission.ts  (4)
    ├── rate-limit.ts  (2)
    ├── resource.ts    (4)
    ├── database.ts    (3)
    ├── external.ts    (3)
    ├── business.ts    (3)
    └── index.ts       ← 分類統一導出
```

**改善效果**：

- 最大檔案大小：10.3KB → 2.5KB（-76%）
- 維護性：按分類獨立修改
- 向後兼容：`ERROR_CODES` 仍可用

---

## 下一步

**任務完成** ✅

### 短期（2 週內）

- [ ] 補充單元測試（createAction, error-codes, audit）
- [ ] 完善文檔（錯誤碼指南、createAction 指南）
- [ ] 決策速率限制統一方案（Upstash vs Prisma）

### 中期（1 個月內）

- [ ] 監控 AuditLog 表大小和查詢效能
- [ ] 清理 `lib/actions/` 舊模組（待確認無其他依賴）
- [ ] 遷移 `documents.ts`（使用 FormData，需特殊處理）
- [ ] 準備 TASK-013：舊模組清理

## 已建立/修改檔案

### Phase 1 新建

```
src/features/_core/
├── error-codes.ts    # 統一錯誤碼
├── permission.ts     # Session-aware 封裝（調用 lib/rbac）
├── audit.ts          # 審計日誌
├── constants.ts      # 共用常數
└── index.ts          # 公開 API

src/lib/patterns/
├── types.ts          # 共用型別
├── server-action.ts  # Action Wrapper
└── index.ts          # 公開 API

prisma/
├── schema/system/audit-log.prisma  # AuditLog + RateLimitLog
└── migrations/20260202161713_add_audit_and_rate_limit/
```

### Phase 1 修改

```
src/lib/rbac/check-permission.ts  # 擴展 checkOwnership 支援 school/course
```

## 架構總結

```
lib/rbac/
├── permissions.ts      # 權限常數（單一來源）
├── check-permission.ts # 所有權檢查（統一 7 種資源）
└── types.ts

lib/patterns/
├── server-action.ts    # Action Wrapper
├── types.ts            # ActionResult, ActionContext
└── index.ts

features/_core/
├── error-codes.ts      # 統一錯誤碼
├── permission.ts       # Session-aware 封裝
├── audit.ts            # 審計日誌
├── constants.ts        # 共用常數
└── index.ts
```

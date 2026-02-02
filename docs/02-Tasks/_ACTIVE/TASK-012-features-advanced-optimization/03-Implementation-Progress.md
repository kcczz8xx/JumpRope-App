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

## 下一步

**任務完成** ✅

可選後續工作：

- 清理 `lib/actions/` 舊模組（待確認無其他依賴）
- 遷移 `documents.ts`（使用 FormData，需特殊處理）

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

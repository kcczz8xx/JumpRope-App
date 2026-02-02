# TASK-012 決策記錄

## 2026-02-03：權限模組整合

### 問題

發現 `src/lib/rbac/permissions.ts` 和 `src/features/_core/permission.ts` 存在重複：

| 面向     | `lib/rbac/permissions.ts` | `_core/permission.ts`  |
| :------- | :------------------------ | :--------------------- |
| 權限格式 | `USER_PROFILE_READ_OWN`   | `school:read`          |
| 映射方向 | Permission → Role[]       | Role → Permission[]    |
| 函式類型 | 同步（需傳入 role）       | 異步（自動取 session） |

### 決策

**整合為單一來源**：

1. **保留 `lib/rbac/permissions.ts`** 作為權限常數定義（單一來源）
2. **簡化 `_core/permission.ts`** 為封裝層：
   - 調用 `lib/rbac` 函式
   - 加入 session 自動取得
   - 保留所有權檢查功能

### 變更

- `_core/permission.ts`：刪除 `ROLE_PERMISSIONS` 重複定義，改為 import `lib/rbac`
- `_core/index.ts`：導出新增的 `checkAnyPermission`, `checkAllPermissions`, `isRoleAtLeast`, `isAdmin`, `isStaffOrAdmin`

### 影響

- 減少維護負擔
- 避免權限定義不一致
- 統一使用 `Permission` type（如 `USER_PROFILE_READ_OWN`）

---

## 2026-02-03：整合 checkOwnership

### 問題

`checkOwnership` 函式有兩個版本處理不同資源：

- `lib/rbac/check-permission.ts`: profile, child, document, address, bank
- `features/_core/permission.ts`: school, course

### 決策

**統一到 `lib/rbac/check-permission.ts`**：

1. 擴展 `OwnershipResourceType` 支援所有資源類型
2. `_core/permission.ts` 調用 `lib/rbac` 而非自己實現
3. 新增 `userRole` 參數支援 school/course 的角色檢查

### 變更

| 檔案                           | 變更                                            |
| :----------------------------- | :---------------------------------------------- |
| `lib/rbac/check-permission.ts` | 新增 `school`, `course` 資源類型                |
| `_core/permission.ts`          | 調用 `rbacCheckOwnership`，移除直接 prisma 調用 |
| `_core/index.ts`               | 導出 `OwnershipResourceType` 類型               |

### 最終架構

```
lib/rbac/
├── permissions.ts      # 權限常數（單一來源）
├── check-permission.ts # 所有權檢查（統一實現）
└── types.ts

features/_core/
└── permission.ts       # Session-aware 封裝（調用 lib/rbac）
```

---

## 2026-02-03：統一 ActionResult 格式

### 問題

發現兩套類型系統不一致：

- `lib/actions/types.ts`: 使用 `{ ok: true/false }`
- `lib/patterns/types.ts`: 使用 `{ success: true/false }`

### 決策

**統一為 `{ success: true/false }` 格式**

選擇此格式原因：

1. 與新的 `lib/patterns/createAction` 一致
2. 更語義化（success 比 ok 更明確）
3. 為未來遷移到新 Action Wrapper 做準備

### 變更

修改 26 個檔案：

- `lib/actions/types.ts` — 核心類型定義
- `lib/actions/guards.ts` — 權限守衛
- `hooks/useUserActions.ts` — 用戶操作 Hook
- `features/auth/` — 3 個檔案
- `features/user/` — 12 個檔案
- `features/school-service/` — 7 個檔案
- `app/dashboard/school/courses/new/page.tsx`

### 影響

- 所有 Server Actions 統一返回格式
- 前端元件統一使用 `result.success` 檢查

---

## 2026-02-03：Auth Actions 遷移到 createAction

### 決策

將 `features/auth/actions/` 下的 7 個 actions 遷移到新的 `createAction` wrapper。

### 遷移的 Actions

| 檔案          | Actions                                                                                               | 審計日誌             |
| :------------ | :---------------------------------------------------------------------------------------------------- | :------------------- |
| `otp.ts`      | `sendOtpAction`, `verifyOtpAction`                                                                    | OTP_SEND, OTP_VERIFY |
| `register.ts` | `registerAction`                                                                                      | USER_REGISTER        |
| `password.ts` | `changePasswordAction`, `resetPasswordSendAction`, `resetPasswordVerifyAction`, `resetPasswordAction` | PASSWORD\_\*         |

### 技術決策

1. **速率限制保留 Upstash Redis** — 在 handler 內部手動調用 `rateLimit()`，不使用 `createAction` 內建的 Prisma 速率限制
2. **移除 `"use server"` 從 `server-action.ts`** — `createAction` 是 factory 函式，返回的閉包才是 server action，調用方已有標記
3. **輔助函式移到 `types.ts`** — `success()` 和 `failure()` 是純函式，不應在 `"use server"` 檔案中

### 新功能

- ✅ 自動 Schema 驗證
- ✅ 審計日誌（記錄到 AuditLog 表）
- ✅ 統一錯誤處理
- ✅ ActionContext 提供 session 資訊

---

## 2026-02-03：School-Service Actions 遷移到 createAction

### 遷移的 Actions

| 檔案        | Actions                                                          | 審計日誌                      |
| :---------- | :--------------------------------------------------------------- | :---------------------------- |
| `school.ts` | `createSchoolAction`, `updateSchoolAction`, `deleteSchoolAction` | SCHOOL_CREATE, UPDATE, DELETE |
| `course.ts` | `createCourseAction`, `deleteCourseAction`                       | COURSE_CREATE, DELETE         |
| `batch.ts`  | `batchCreateWithSchoolAction`                                    | BATCH_CREATE_SCHOOL_COURSES   |

### API 簽名變更

`deleteSchoolAction` 和 `deleteCourseAction` 從 `(id: string)` 改為 `({ id: string })`。

**影響**：目前沒有元件直接調用這些函式，無破壞性變更。

### Schema 類型修復

修改 `schemas/batch.ts` 讓類型與元件一致：

- `startDate`: `.optional()` → `.optional().nullable()`
- `courseDescription`: `.optional()` → `.optional().nullable()`

### 統計

| 指標                   | 遷移前 | 遷移後 |
| :--------------------- | :----- | :----- |
| 總遷移 Actions         | 0      | 13     |
| Auth Actions           | 7      | 7      |
| School-Service Actions | 0      | 6      |

---

## 2026-02-03：User Actions 遷移到 createAction

### 遷移的 Actions

| 檔案          | Actions                                                       | 審計日誌                        |
| :------------ | :------------------------------------------------------------ | :------------------------------ |
| `profile.ts`  | `updateProfileAction`                                         | USER_PROFILE_UPDATE             |
| `address.ts`  | `updateAddressAction`, `deleteAddressAction`                  | USER_ADDRESS_UPDATE/DELETE      |
| `bank.ts`     | `updateBankAction`, `deleteBankAction`                        | USER_BANK_UPDATE/DELETE         |
| `children.ts` | `createChildAction`, `updateChildAction`, `deleteChildAction` | USER_CHILD_CREATE/UPDATE/DELETE |

### 保留原模式

`documents.ts` 使用 FormData 輸入，不適合 `createAction`（設計用於 JSON 輸入）。保留使用 `requireUser()` + `success()`/`failure()`。

### 統計

| 指標                   | 遷移前 | 遷移後 |
| :--------------------- | :----- | :----- |
| 總遷移 Actions         | 13     | 21     |
| Auth Actions           | 7      | 7      |
| School-Service Actions | 6      | 6      |
| User Actions           | 0      | 8      |

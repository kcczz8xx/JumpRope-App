# 表單驗證規範化 - 實施進度

## 狀態：✅ 已完成

## 進度追蹤

### Phase 1: 基礎設施 ✅ 完成

| 項目                     | 狀態    | 備註               |
| :----------------------- | :------ | :----------------- |
| 安裝 react-hook-form     | ✅ 完成 |                    |
| 安裝 @hookform/resolvers | ✅ 完成 |                    |
| 建立 schemas/ 目錄       | ✅ 已有 | 原本已存在         |
| 建立 common.ts           | ✅ 完成 | 共用 schema        |
| 建立 signin.ts           | ✅ 完成 | SignIn schema      |
| 確認 createAction 支援   | ✅ 確認 | 第 89-100 行已實作 |

### Phase 2: 遷移表單

| 表單              | Schema | Component | Action | 測試 |
| :---------------- | :----- | :-------- | :----- | :--- |
| SignInForm        | ✅     | ✅        | N/A    | ⬜   |
| SignUpForm        | ✅     | ✅        | N/A    | ⬜   |
| ResetPasswordForm | ✅     | ✅        | N/A    | ⬜   |

### Phase 3: 文檔更新 ✅ 完成

| 項目                          | 狀態    |
| :---------------------------- | :------ |
| 更新 STRUCTURE.md             | ✅ 完成 |
| 建立 Form-Validation-Guide.md | ✅ 完成 |

## Next Steps

✅ 任務完成，可歸檔至 `_ARCHIVE/2026-02/`

**建議後續**：

1. 運行 `pnpm dev` 測試所有表單驗證功能
2. 考慮將 React Hook Form 模式擴展到其他功能（user profile、school-service 等）

## 會話記錄

### Session 1 (2026-02-03)

- 建立任務文件夾和文檔
- 定義需求和技術方案
- **Phase 1 完成**：
  - 安裝 `react-hook-form` 和 `@hookform/resolvers`
  - 確認 `createAction` 已支援 schema 驗證
  - 建立 `schemas/common.ts`（phoneSchema, passwordSchema, emailSchema 等）
  - 建立 `schemas/signin.ts`（signInSchema + SignInInput type）
  - `pnpm type-check` ✅ 通過
- **SignInForm 重構完成**：
  - 使用 `useForm` + `zodResolver(signInSchema)`
  - 使用 `Controller` 控制表單欄位
  - 使用 `useTransition` 處理 pending 狀態
  - 175 行 → 206 行（結構更清晰，驗證邏輯集中於 schema）
  - `pnpm type-check` ✅ 通過

### Session 2 (2026-02-04)

**Phase 2 完成 - 所有表單遷移**：

| 表單              | Schema 檔案         | 變更摘要                                         |
| :---------------- | :------------------ | :----------------------------------------------- |
| SignInForm        | `signin.ts`         | 使用 RHF + Controller，驗證邏輯集中於 schema     |
| SignUpForm        | `signup.ts`         | 使用 `safeParse()` 替代手動驗證（~35 行 → 8 行） |
| ResetPasswordForm | `reset-password.ts` | 請求和新密碼步驟使用 schema 驗證                 |

**驗證**：`pnpm type-check` ✅ 通過

### Session 3 (2026-02-03)

**school-service 重構**：

1. **Components 結構重構**（參照 auth/components 模式）：

   - `course/` → `new-course/`
   - `pages/overview/` → `overview/`
   - `pages/detailed/school-info-cards/` → `school-detail/`
   - `pages/detailed/course-cards/` → `course-detail/`
   - `types/` 目錄 → `types.ts` 單一檔案

2. **表單驗證規範化**：
   - 新增 `schemas/common.ts`（共用 schema、常數）
   - 新增 `schemas/new-course.ts`（多步驟表單驗證）
   - 重構 `useNewCourseFormValidation.ts` 使用 Zod safeParse

| 項目                            | 狀態    |
| :------------------------------ | :------ |
| Components 結構重構             | ✅ 完成 |
| common.ts 共用 schema           | ✅ 完成 |
| new-course.ts 表單 schema       | ✅ 完成 |
| useNewCourseFormValidation 重構 | ✅ 完成 |
| TypeScript 編譯                 | ✅ 通過 |

**詳細記錄**：`90-Chat-Log/school-service-refactor-summary.md`

### Session 3.1 (2026-02-03) - new-course 子目錄細分

**進一步整理 new-course 目錄**：

```
new-course/
├── steps/     # SchoolFormStep, CoursesFormStep, SummaryFormStep
├── cards/     # 所有卡片元件
├── hooks/     # useNewCourseFormValidation
├── NewCourseForm.tsx
└── index.ts
```

| 項目                 | 狀態    |
| :------------------- | :------ |
| 建立 steps/ 子目錄   | ✅ 完成 |
| 建立 cards/ 子目錄   | ✅ 完成 |
| 建立 hooks/ 子目錄   | ✅ 完成 |
| 更新所有 import 路徑 | ✅ 完成 |
| TypeScript 編譯      | ✅ 通過 |

### Session 4 (2026-02-03) - user 模組表單重構

**重構 user 模組 Modal 表單使用 Zod 驗證**：

| Modal                   | 狀態                  |
| :---------------------- | :-------------------- |
| UserAddressEditModal    | ✅ 使用 safeParse     |
| UserBankEditModal       | ✅ 使用 safeParse     |
| UserChildEditModal      | ✅ 使用 safeParse     |
| UserChangePasswordModal | ✅ 已符合規範（RHF）  |
| UserInfoEditModal       | ⏸️ 複雜流程，暫不處理 |

**驗證**：`pnpm type-check` ✅ 通過

**詳細記錄**：`90-Chat-Log/user-module-refactor-summary.md`

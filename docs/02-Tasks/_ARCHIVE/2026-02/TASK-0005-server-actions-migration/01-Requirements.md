# Server Actions 遷移需求

## 背景

目前專案使用 API Routes 處理前端資料請求，共 17 個 endpoints。Next.js 15 + React 19 完全支援 Server Actions，可以：
- 減少 boilerplate 代碼
- 提升類型安全（直接傳遞 TypeScript 類型）
- 簡化錯誤處理
- 減少網路請求開銷

## 目標

將「內部 UI 觸發的 CRUD」遷移到 Server Actions，保留必要的 API Routes。

## 遷移範圍

### 需遷移（16 個）

| 模組 | Endpoint | 方法 |
|:-----|:---------|:-----|
| auth | `/api/auth/change-password` | POST |
| auth | `/api/auth/otp/send` | POST |
| auth | `/api/auth/otp/verify` | POST |
| auth | `/api/auth/register` | POST |
| auth | `/api/auth/reset-password/send` | POST |
| auth | `/api/auth/reset-password/verify` | POST |
| auth | `/api/auth/reset-password/reset` | POST |
| user | `/api/user/profile` | GET, PATCH |
| user | `/api/user/address` | GET, PATCH |
| user | `/api/user/bank` | GET, PATCH |
| user | `/api/user/children` | GET, POST, PATCH, DELETE |
| user | `/api/user/tutor/document` | POST |
| school | `/api/school-service/courses` | GET, POST |
| school | `/api/school-service/courses/batch-with-school` | POST |
| school | `/api/school-service/schools` | GET, POST |
| school | `/api/school-service/schools/[id]` | GET, PATCH |

### 保留（1 個）

| Endpoint | 原因 |
|:---------|:-----|
| `/api/auth/[...nextauth]` | NextAuth 核心，必須保留 |

## 驗收標準

### 功能性

- [ ] 所有現有功能正常運作
- [ ] 錯誤訊息正確顯示
- [ ] Rate limit 正常運作
- [ ] 權限檢查正常運作

### 代碼品質

- [ ] `lib/actions/` 基礎設施完整
- [ ] 每個 feature 有 `actions.ts`
- [ ] 每個 feature 有 `queries.ts`（如需要）
- [ ] 統一使用 `ActionResult<T>` 回傳格式
- [ ] 所有 actions 有 Zod 驗證

### 測試

- [ ] `pnpm lint` 通過
- [ ] `pnpm type-check` 通過
- [ ] `pnpm build` 成功

## 非目標

- 不修改 UI/UX
- 不新增功能
- 不修改資料庫結構

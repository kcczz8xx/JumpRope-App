# 實施進度

## 當前狀態：全部階段完成 ✅

## 進度追蹤

### 階段一：建立規範 ✅

- [x] 建立 `src/features/STRUCTURE.md`
- [x] 更新 `src/features/AGENTS.md`（加入 server.ts 規則）

### 階段二：重構 auth ✅

- [x] 分析 `auth/actions.ts` 邏輯域（OTP、註冊、密碼）
- [x] 建立 `auth/actions/` 子目錄
  - `_helpers.ts` - 共用輔助函式
  - `otp.ts` - sendOtpAction, verifyOtpAction
  - `register.ts` - registerAction
  - `password.ts` - changePasswordAction, resetPassword\*
  - `index.ts` - 統一導出
- [x] 建立 `auth/schemas/` 子目錄
  - `otp.ts`, `register.ts`, `password.ts`, `index.ts`
- [x] 無需 queries（auth 沒有獨立查詢）
- [x] 建立 `auth/server.ts`
- [x] 更新 `auth/index.ts`
- [x] 刪除舊檔案（actions.ts, schema.ts）
- [ ] 驗證 build 通過（待用戶執行）

### 階段三：重構 school-service ✅

- [x] 分析邏輯域（School、Course、Batch）
- [x] 建立 `actions/` 子目錄
  - `school.ts` - create, update, delete
  - `course.ts` - create, delete
  - `batch.ts` - batchCreateWithSchool
  - `index.ts`
- [x] 建立 `schemas/` 子目錄
  - `school.ts`, `contact.ts`, `course.ts`, `batch.ts`, `index.ts`
- [x] 建立 `queries/` 子目錄
  - `school.ts`, `course.ts`, `index.ts`
- [x] 建立 `server.ts`
- [x] 更新 `index.ts`
- [x] 刪除舊檔案（actions.ts, schema.ts, queries.ts）
- [ ] 驗證 build 通過

### 階段四：自動化腳本 ✅

- [x] 建立 `scripts/create-feature.js`
- [x] 更新 `package.json`（新增 `create:feature` 指令）

## 下一步

1. 用戶執行 `pnpm build` 驗證重構無誤
2. 測試 `pnpm create:feature test-feature` 腳本
3. 完成驗證後將任務移至 `_ARCHIVE/2026-02/`

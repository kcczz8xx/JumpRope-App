# TASK-012 Features 架構進階優化 - 需求文檔

## 背景

TASK-011 完成後，`auth`、`school-service`、`user` 三個 features 已統一為分層式架構。但在分析過程中發現以下痛點：

1. **跨 Feature 邏輯重複** — OTP 速率限制、權限檢查等邏輯在多處重複
2. **無統一錯誤碼系統** — 錯誤訊息不一致（如 `RATE_LIMITED` vs `TOO_MANY`）
3. **缺乏跨域基礎設施** — 每個 feature 重新實現審計、認證檢查

## 目標

建立可擴展的 Feature 基礎設施，實現：

- 統一錯誤碼系統（編譯期檢查 + i18n 支持）
- 通用 Server Action Wrapper（自動處理認證、權限、速率限制、審計）
- Feature 內核模組（`_core`）集中管理跨域邏輯

## 驗收標準

### Phase 1：基礎設施

- [ ] `src/features/_core/error-codes.ts` — 統一錯誤碼定義
- [ ] `src/features/_core/permission.ts` — RBAC + 所有權檢查
- [ ] `src/features/_core/audit.ts` — 審計日誌
- [ ] `src/lib/patterns/server-action.ts` — Action Wrapper
- [ ] Prisma schema 更新（AuditLog model）

### Phase 2：遷移

- [ ] `auth` 模組遷移至新模式
- [ ] `school-service` 模組遷移至新模式
- [ ] 所有現有測試通過

### Phase 3：文檔

- [ ] 更新 `STRUCTURE.md`
- [ ] 更新 `create-feature.js` 腳本
- [ ] 建立遷移指南

## 量化目標

| 指標 | 現況 | 目標 |
|------|------|------|
| Average Action 檔案行數 | 95 行 | 60 行 |
| 驗證/認證重複 | 4x | 1x |
| 錯誤一致性 | 60% | 100% |

## 非目標

- 不修改現有 UI 組件
- 不修改資料庫 schema（除 AuditLog）
- 不影響現有 API 行為

## 風險

| 風險 | 緩解措施 |
|------|----------|
| 遷移過程破壞現有功能 | 漸進式遷移 + 完整測試覆蓋 |
| Action Wrapper 過度抽象 | 保持 opt-in 設計，不強制使用 |
| 學習曲線 | 詳細文檔 + 範例代碼 |

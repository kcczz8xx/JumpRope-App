# 需求規格

## 問題背景

`src/features/user/` 的 `actions.ts` 達 16KB（587 行），包含 5 個不同邏輯域：

1. Profile Actions
2. Address Actions
3. Bank Actions
4. Children Actions
5. Tutor Document Actions

## 問題分析

- **維護困難**：單一大型檔案難以導航
- **可讀性差**：跳轉查找特定 action/schema 費時
- **協作衝突**：多人同時改同一文件易有 git conflict
- **擴展性弱**：日後增加更多功能時難以維護

## 需求目標

1. 將 `actions.ts` 拆分為 `actions/` 子目錄
2. 將 `schema.ts` 拆分為 `schemas/` 子目錄
3. 將 `queries.ts` 拆分為 `queries/` 子目錄
4. 保持對外 API 不變（`index.ts` 導出路徑相容）
5. 更新 `AGENTS.md` 規範，加入子目錄模式說明

## 驗收標準

- [ ] `pnpm build` 通過
- [ ] 所有現有 import 路徑正常運作
- [ ] 每個子目錄有 `index.ts` 統一導出
- [ ] `AGENTS.md` 包含大型 Feature 拆分建議

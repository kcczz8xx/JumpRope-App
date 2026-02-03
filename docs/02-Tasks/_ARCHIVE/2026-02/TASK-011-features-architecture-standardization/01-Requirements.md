# 需求規格

## 問題背景

`src/features/` 下三個模組使用**不同的組織模式**：

| Feature | 結構模式 | 問題 |
|---------|----------|------|
| **auth** | 扁平式 | `actions.ts` 10.9KB、無 `server.ts` |
| **user** | 分層式 ✅ | 已完成重構，結構良好 |
| **school-service** | 混合式 | `actions.ts` 10.9KB、無 `server.ts` |

## 問題分析

1. **缺乏統一標準**
   - 新成員不知應該跟哪個模式
   - AI Agent 難以預測檔案位置
   - 重構時需逐個 feature 判斷

2. **單檔案過大**
   - `auth/actions.ts` 和 `school-service/actions.ts` 均超過 10KB
   - 超過建議上限（~150 行 / 檔案）
   - Git 合併衝突風險高

3. **缺少 `server.ts` 分離**
   - 只有 `user` 有 `server.ts`
   - 其他 features 的 queries 可能被 client 誤 import
   - 影響 bundle size 和 tree-shaking

## 需求目標

### 必須完成
1. 建立 `src/features/STRUCTURE.md` 規範文件
2. 重構 `auth` feature 為分層式結構
3. 重構 `school-service` feature 為分層式結構
4. 為 `auth` 和 `school-service` 加入 `server.ts`

### 選擇性完成
5. 建立 `scripts/create-feature.js` 自動化腳本
6. 更新 `package.json` 加入 `create:feature` 指令

## 驗收標準

- [ ] `pnpm build` 通過
- [ ] `pnpm type-check` 通過
- [ ] 所有現有 import 路徑正常運作
- [ ] 三個 features 結構一致（分層式）
- [ ] `STRUCTURE.md` 規範完整且清晰
- [ ] 每個 action 檔案 < 150 行

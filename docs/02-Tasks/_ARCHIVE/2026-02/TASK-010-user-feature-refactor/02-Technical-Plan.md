# 技術方案

## 架構設計

### 重構前

```
src/features/user/
├── components/
├── actions.ts      # 587 行 (16KB)
├── queries.ts      # 200 行
├── schema.ts       # 127 行
└── index.ts
```

### 重構後

```
src/features/user/
├── components/
├── actions/
│   ├── _helpers.ts      # 共用輔助函式（_ 前綴避免導出）
│   ├── profile.ts
│   ├── address.ts
│   ├── bank.ts
│   ├── children.ts
│   ├── documents.ts
│   └── index.ts
├── schemas/
│   ├── profile.ts
│   ├── address.ts
│   ├── bank.ts
│   ├── children.ts
│   ├── documents.ts
│   └── index.ts
├── queries/
│   ├── profile.ts
│   ├── address.ts
│   ├── bank.ts
│   ├── children.ts
│   ├── documents.ts
│   └── index.ts
└── index.ts
```

## 實施步驟

1. 建立 `actions/` 子目錄
   - 建立 `_helpers.ts` 放置 `getClientIP()` 等共用函式
   - 拆分 5 個邏輯域到獨立檔案
   - 建立 `index.ts` 統一導出

2. 建立 `schemas/` 子目錄
   - 拆分對應的 schema 到獨立檔案
   - 每個檔案導出 schema 和對應的 type

3. 建立 `queries/` 子目錄
   - 拆分 queries 到獨立檔案

4. 更新 `index.ts`
   - 從子目錄 index 導入並重新導出

5. 刪除舊檔案
   - 移除 `actions.ts`、`schema.ts`、`queries.ts`

6. 驗證
   - 執行 `pnpm build` 確認編譯通過

## 風險評估

- **低風險**：純重構，不改變業務邏輯
- **向後相容**：對外 API 不變

# 技術方案

## 目標架構

採用 `user` feature 的分層式結構作為標準：

```
features/[feature-name]/
├── actions/              # Server Actions（按功能拆檔）
│   ├── _helpers.ts       # 共用輔助函式（_ 前綴避免導出）
│   ├── [action-name].ts
│   └── index.ts          # 統一導出
├── queries/              # 資料查詢（Server-only）
│   ├── [query-name].ts
│   └── index.ts
├── schemas/              # Zod 驗證（按 action 對應）
│   ├── [schema-name].ts
│   └── index.ts
├── components/           # UI 元件
├── hooks/                # 自訂 Hooks（optional）
├── types.ts              # 共用型別（optional）
├── server.ts             # Server-only exports
└── index.ts              # Client-accessible exports
```

## 實施階段

### 階段一：建立規範（30 分鐘）

1. 建立 `src/features/STRUCTURE.md`
   - 標準目錄結構說明
   - 檔案拆分原則
   - Import 規則
   - 範例代碼

### 階段二：重構 auth（1.5 小時）

**現況**：
```
auth/
├── actions.ts     # 10.9KB（需拆分）
├── schema.ts      # 2.7KB
├── components/    # 14 items
└── index.ts
```

**步驟**：

1. 分析 `actions.ts` 內容，識別邏輯域
2. 建立 `actions/` 子目錄
   - 拆分為獨立檔案（register, send-otp, verify-otp, reset-password 等）
   - 建立 `_helpers.ts` 放置共用函式
   - 建立 `index.ts` 統一導出
3. 建立 `schemas/` 子目錄
   - 對應 actions 拆分
4. 建立 `queries/` 子目錄（如有需要）
5. 建立 `server.ts`
6. 更新 `index.ts`
7. 刪除舊的 `actions.ts`、`schema.ts`

### 階段三：重構 school-service（1.5 小時）

**現況**：
```
school-service/
├── actions.ts     # 10.9KB（需拆分）
├── schema.ts      # 5.3KB
├── queries.ts     # 4.3KB
├── components/    # 18 items
└── index.ts
```

**步驟**：

1. 分析 `actions.ts` 內容，識別邏輯域
2. 建立 `actions/` 子目錄
3. 建立 `schemas/` 子目錄
4. 建立 `queries/` 子目錄（從 `queries.ts` 拆分）
5. 建立 `server.ts`
6. 更新 `index.ts`
7. 刪除舊檔案

### 階段四：建立自動化腳本（30 分鐘）

1. 建立 `scripts/create-feature.js`
2. 更新 `package.json` 加入 `create:feature` 指令

## 風險評估

| 風險 | 等級 | 緩解措施 |
|------|------|----------|
| Import 路徑失效 | 中 | 保持 `index.ts` 導出相容 |
| 遺漏導出 | 低 | 逐一對比舊檔案 exports |
| 循環依賴 | 低 | `_helpers.ts` 只放純函式 |

## 依賴關係

```
階段一 → 階段二 → 階段三 → 階段四
         ↓
      可並行（階段二、三 無依賴）
```

## 預估時間

- 階段一：30 分鐘
- 階段二：1.5 小時
- 階段三：1.5 小時
- 階段四：30 分鐘
- **總計**：約 4 小時

# 實施進度

## 完成項目

| 項目 | 狀態 | 備註 |
|:-----|:-----|:-----|
| 建立 `actions/` 子目錄 | ✅ | 6 個檔案 |
| 建立 `schemas/` 子目錄 | ✅ | 6 個檔案 |
| 建立 `queries/` 子目錄 | ✅ | 6 個檔案 |
| 更新 `index.ts` 導出路徑 | ✅ | |
| 刪除舊檔案 | ✅ | actions.ts, schema.ts, queries.ts |
| 更新 `AGENTS.md` 規範 | ✅ | 新增 10KB 閾值建議 |
| `pnpm build` 驗證 | ✅ | |

## 建立的檔案清單

### actions/
- `_helpers.ts` — 共用輔助函式
- `profile.ts` — 個人資料操作
- `address.ts` — 地址操作
- `bank.ts` — 收款資料操作
- `children.ts` — 學員管理操作
- `documents.ts` — 導師文件操作
- `index.ts` — 統一導出

### schemas/
- `profile.ts`
- `address.ts`
- `bank.ts`
- `children.ts`
- `documents.ts`
- `index.ts`

### queries/
- `profile.ts`
- `address.ts`
- `bank.ts`
- `children.ts`
- `documents.ts`
- `index.ts`

## 其他 Features 評估結果

| Feature | 檔案大小 | 邏輯域 | 建議 |
|:--------|:---------|:-------|:-----|
| `auth` | 389 行 (~12KB) | 1 | 暫不拆分 - 邏輯緊密耦合 |
| `school-service` | 352 行 (~11KB) | 2 | 暫不拆分 - 規模可控 |

## Next Steps

- 無（任務已完成）

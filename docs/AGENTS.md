# Documentation System Guidelines

當處理 `docs/` 目錄下的檔案時，遵循以下規範：

## 目錄職責

| 目錄 | 用途 | 更新頻率 |
|:-----|:-----|:---------|
| `00-Context/` | 業務背景、術語表、角色 | 低 |
| `01-Architecture/` | 系統設計、資料模型、路由 | 中 |
| `02-Tasks/` | 任務管理（唯一活躍工作區） | 高 |
| `03-Knowledge-Base/` | 最佳實踐（從 task 抽取） | 中 |
| `04-Reference/` | 速查表 | 低 |
| `05-Issues-Log/` | 問題記錄、修復策略 | 中 |
| `99-Meta/` | 規範、模板、索引 | 低 |

## 任務管理規則

- `_ACTIVE/` 最多 1-3 個任務（建議 1 個）
- 每個任務必須有 `00-task-info.yaml` 作為 Single Source of Truth
- 對話輸出放入 `90-Chat-Log/`，不要散落到其他目錄
- 完成後移動到 `_ARCHIVE/YYYY-MM/`

## 任務文件夾標準結構

```
TASK-XXXX-feature-name/
├── 00-task-info.yaml           # 任務元資訊（必須）
├── 01-Requirements.md          # 需求 + 驗收標準
├── 02-Technical-Plan.md        # 技術方案
├── 03-Implementation-Progress.md # 進度追蹤
├── 04-Decisions.md             # 決策記錄
├── 05-Testing-Checklist.md     # 測試清單
└── 90-Chat-Log/                # 對話輸出
```

## 禁止事項

- 不要把對話散落到多個 task folder
- 不要把未完成的思路直接寫入 00-Context / 01-Architecture
- 不要直接修改已歸檔的任務文檔

## 每次對話完必須

1. 更新 `03-Implementation-Progress.md`（清晰的 Next steps）
2. 如有新決策：追加到 `04-Decisions.md`
3. 如有新 bug：記錄到 `05-Issues-Log/`

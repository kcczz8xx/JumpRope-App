# 文檔系統規範

> 定義 JumpRope-App 開發文檔的組織與維護規則  
> **版本**：1.0.0 | **建立日期**：2026-02-02

---

## 系統目標

1. **沉澱開發過程** — 每次對話的「構思 → 設計 → 執行 → 驗證」完整記錄到任務文件夾
2. **快速上手** — 任何人/AI 開工前，只需讀「當前任務文件夾」即可獲得最相關上下文
3. **Single Source of Truth** — 每類資訊只存在一處，避免重複與不一致

---

## 目錄職責

| 目錄                 | 用途                                     | 更新頻率 |
| :------------------- | :--------------------------------------- | :------- |
| `00-Context/`        | 業務背景、術語表、角色、全局規則         | 低       |
| `01-Architecture/`   | 系統設計、資料模型、路由、權限、重要決策 | 中       |
| `02-Tasks/`          | 唯一的「活躍工作區」                     | 高       |
| `03-Knowledge-Base/` | 最佳實踐沉澱（從 task 抽取）             | 中       |
| `04-Reference/`      | 速查表（可由 AI 半自動整理）             | 低       |
| `05-Issues-Log/`     | 已知問題、root cause、修復策略           | 中       |
| `99-Meta/`           | 規範、模板、索引、AI 規則                | 低       |

---

## 任務狀態管理

任務以文件夾分類，狀態流轉如下：

```
建立 → _ACTIVE ⇄ _PAUSED → _ARCHIVE/YYYY-MM/
```

| 狀態   | 目錄                | 限制                        |
| :----- | :------------------ | :-------------------------- |
| 進行中 | `_ACTIVE/`          | 最多 1-3 個（建議 1 個）    |
| 暫停   | `_PAUSED/`          | 不限，但必須有 pause reason |
| 已完成 | `_ARCHIVE/YYYY-MM/` | 按月份歸檔                  |

### ACTIVE 任務唯一性

如果同時存在多個 ACTIVE，必須在每個 task 的 `00-task-info.yaml` 指明：

- `focus: true/false` — 只有 1 個可以 true
- `why_active` — 為什麼仍要 active

---

## 任務文件夾標準

每個任務 folder 必須包含：

| 檔案                            | 用途                 |
| :------------------------------ | :------------------- |
| `00-task-info.yaml`             | 任務元資訊（必須）   |
| `01-Requirements.md`            | 需求 + 驗收標準      |
| `02-Technical-Plan.md`          | 設計方案 + 影響檔案  |
| `03-Implementation-Progress.md` | 進度 + TODO          |
| `04-Decisions.md`               | 決策記錄，含替代方案 |
| `05-Testing-Checklist.md`       | 可重複執行的測試清單 |
| `90-Chat-Log/`                  | 每次對話輸出放入     |

---

## 每次對話的產出規則

### 必須做

1. 在 `90-Chat-Log/` 新增一份 chat log
2. 更新 `03-Implementation-Progress.md` — Next steps 必須清晰
3. 如有新決策：追加到 `04-Decisions.md`（以日期時間開新小節）
4. 如有新 bug：追加到 `docs/05-Issues-Log/`（或先記 task 再抽取）

### 禁止做

- 把對話散落到多個 task folder
- 把未完成的思路直接寫入 `00-Context/` 或 `01-Architecture/`（先放 task，完成後抽取）

---

## task-info.yaml 模板

```yaml
task_id: TASK-0001
title: "Feature: XXX"
status: ACTIVE # ACTIVE | PAUSED | ARCHIVED
priority: P0 # P0 | P1 | P2
owner: "human"
created_at: "2026-02-02"

context_files:
  - "app/..."
  - "prisma/..."

decisions:
  - "04-Decisions.md#2026-02-02-xxxx"

acceptance_criteria:
  - "..."

next_steps:
  - "..."

risks:
  - "..."
```

---

**最後更新**：2026-02-02

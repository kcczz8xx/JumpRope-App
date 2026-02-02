# Active Task Rules

**Scope**: This applies to all active tasks.

## 核心原則

1. **專注當前任務** — 只處理當前任務文件夾，不要修改其他 task folders
2. **Single Source of Truth** — `00-task-info.yaml` 是當前任務的主要指引
3. **對話記錄** — 每次對話輸出必須保存到當前任務的 `90-Chat-Log/`
4. **進度更新** — 每次對話結束時更新 `03-Implementation-Progress.md`

## 讀取順序

1. `00-task-info.yaml` — 任務元資訊
2. `01-Requirements.md` — 需求與驗收標準
3. `02-Technical-Plan.md` — 技術方案
4. `context_files` 列出的代碼文件

## 對話結束時必須

- [ ] 更新 `03-Implementation-Progress.md`（清晰的 Next steps）
- [ ] 如有決策：追加到 `04-Decisions.md`
- [ ] 如有 bug：記錄到 `docs/05-Issues-Log/`

## 禁止

- 修改其他 task folders 的文件
- 把對話記錄散落到多個位置
- 直接修改 `docs/00-Context/` 或 `docs/01-Architecture/`（先記在任務內，完成後抽取）

# TASK-005 建立記錄 - 2026-02-02 Session 1

## 任務狀態：⬜ 已建立

---

## 建立背景

基於 TASK-004 完成後的組件審查報告，發現 6 個可優化項目：

| Issue | 優先級 | 說明 |
|:------|:-------|:-----|
| 缺少 a11y 支援 | 🔴 高 | PasswordField、OtpInput 缺少 aria 屬性 |
| SubmitButton 樣式不統一 | 🟡 中 | 未使用 Tailadmin Button |
| FormError 缺少 Icon | 🟡 中 | 純文字缺乏視覺提示 |
| 缺少 Loading Spinner | 🟡 中 | SubmitButton 只有文字 |
| SignUpForm 重複倒計時 | 🟢 低 | 已有 useCountdown 但未使用 |
| 缺少 FormField Wrapper | 🟢 低 | 選做 |

---

## 任務文檔結構

```
TASK-005-form-components-a11y-enhancement/
├── 00-task-info.yaml           ✅ 已建立
├── 01-Requirements.md          ✅ 已建立
├── 02-Technical-Plan.md        ✅ 已建立
├── 03-Implementation-Progress.md ✅ 已建立
├── 04-Decisions.md             ✅ 已建立
└── 90-Chat-Log/
    └── 2026-02-02-session-1-task-creation.md ✅ 本文檔
```

---

## 預估工作量

| Phase | 內容 | 預估時間 |
|:------|:-----|:---------|
| Phase 1 | PasswordField a11y | 45 min |
| Phase 2 | OtpInput a11y | 30 min |
| Phase 3 | SubmitButton 改用 Tailadmin Button | 30 min |
| Phase 4 | FormError 增強 | 20 min |
| Phase 5 | SignUpForm 使用 useCountdown | 10 min |
| **總計** | | **2.5h** |

---

## 關鍵決策

1. **DEC-001**：向後兼容 — 所有新 props 有預設值
2. **DEC-002**：內建 Icon — FormError 自包含 SVG
3. **DEC-003**：統一按鈕 — 使用 Tailadmin Button

---

## Next Steps

1. 開始 Phase 1: PasswordField a11y 增強
2. 依序完成 Phase 2-5
3. 驗證 build/lint 通過

---

## 相關任務

- **前置任務**：TASK-004（已歸檔）
- **歸檔位置**：`docs/02-Tasks/_ARCHIVE/2026-02/TASK-004-component-architecture-refactor/`

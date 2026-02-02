# 04 - 決策記錄

## DEC-001: 使用 `shared/` 而非擴展 `ui/`

**日期**: 2026-02-02  
**狀態**: 已決定

### 背景

需要決定跨功能共用組件的放置位置。

### 選項

| 選項 | 優點 | 缺點 |
|:-----|:-----|:-----|
| A) 放在 `components/ui/` | 不需新增資料夾 | 與 shadcn/ui 混淆，語義不清 |
| B) 放在 `components/shared/` | 清楚區分層級，語義明確 | 新增一層資料夾 |
| C) 放在各 `features/` | 符合 colocation | 重複代碼，違反 DRY |

### 決定

**選擇 B**：建立 `components/shared/` 中間層

### 理由

1. `ui/` 保留給最底層的 UI 原子組件（Button, Input）
2. `shared/` 明確表示「跨功能共用但非基礎 UI」
3. 與現有 Feature-First 架構相容

---

## DEC-002: 共用組件採用 Controlled 模式

**日期**: 2026-02-02  
**狀態**: 已決定

### 背景

共用表單組件應採用 Controlled 還是 Uncontrolled 模式。

### 決定

採用 **Controlled 模式**（接收 `value` + `onChange`）

### 理由

1. 與現有 SignInForm 的狀態管理相容
2. 更容易在父組件進行驗證
3. 便於整合 react-hook-form（未來擴展）

# 04 - 決策記錄

## DEC-001: 向後兼容 API 設計

**日期**：2026-02-02

**決策**：所有新增的 props 都有預設值，確保現有調用不需修改。

**原因**：
- TASK-004 的組件已被多處使用
- 破壞性變更需要大量修改
- 漸進式增強更安全

**範例**：
```typescript
// 新增 props 都有預設值
interface PasswordFieldProps {
  error?: string;              // 預設 undefined
  disabled?: boolean;          // 預設 false
  autoComplete?: string;       // 預設 "current-password"
  required?: boolean;          // 預設 true
}
```

---

## DEC-002: 內建 AlertCircle Icon

**日期**：2026-02-02

**決策**：FormError 內建 SVG Icon，而非依賴 `@/icons`。

**原因**：
- 避免新增外部依賴
- 單一用途 Icon，不需復用
- 減少 import 複雜度

**影響**：
- FormError 組件自包含
- 未來可考慮統一到 icons 目錄

---

## DEC-003: SubmitButton 統一使用 Tailadmin Button

**日期**：2026-02-02

**決策**：SubmitButton 改用 `@/components/tailadmin/ui/button/Button`。

**原因**：
- 專案已有完整 Button 實作
- 避免重複定義樣式
- 確保視覺一致性

**替代方案**：
- ❌ 繼續使用 `<button>` + 手動樣式（不一致）
- ❌ 建立新的 Button 組件（重複）

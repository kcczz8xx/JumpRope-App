# 01 - 需求規格

## 背景

TASK-004 已建立 `components/shared/forms/` 共用組件，但缺少：
- **Accessibility 支援**：無 aria-label、aria-invalid 等屬性
- **視覺一致性**：SubmitButton 未使用專案現有 Button 組件
- **錯誤提示**：FormError 缺少 Icon、role="alert"
- **Loading 反饋**：SubmitButton 只有文字，缺少 Spinner

## 問題分析

| Issue | 優先級 | 影響 |
|:------|:-------|:-----|
| 缺少 a11y 支援 | 🔴 高 | Screen reader 用戶無法正確理解表單狀態 |
| SubmitButton 樣式不統一 | 🟡 中 | 與 Tailadmin Button 重複定義樣式 |
| FormError 缺少 Icon | 🟡 中 | 純文字缺乏視覺提示 |
| 缺少 Loading Spinner | 🟡 中 | 用戶不確定是否正在處理 |
| SignUpForm 重複倒計時 | 🟢 低 | 已有 useCountdown 但未使用 |

## 功能需求

### FR-1: PasswordField a11y 增強

**新增屬性**：
- `id`（使用 `useId` 自動生成）
- `error?: string`
- `disabled?: boolean`
- `autoComplete?: string`
- `required?: boolean`

**aria 屬性**：
- `aria-invalid={!!error}`
- `aria-describedby={errorId}`
- `aria-required={required}`
- 切換按鈕加 `aria-label` 和 `aria-pressed`

### FR-2: OtpInput a11y 增強

**新增屬性**：
- `error?: boolean`
- `ariaLabel?: string`

**aria 屬性**：
- Wrapper 加 `role="group"` 和 `aria-label`
- 每個輸入框加 `aria-label="驗證碼第 X 位"`
- `aria-invalid={error}`

### FR-3: SubmitButton 改用 Tailadmin Button

- 統一使用 `@/components/tailadmin/ui/button/Button`
- 新增 `size` 和 `variant` props
- 加入 Loading Spinner SVG
- 加入 `aria-busy={isLoading}`

### FR-4: FormError 增強

**新增屬性**：
- `showIcon?: boolean`（預設 true）
- `variant?: "inline" | "block"`

**功能**：
- 加入 `role="alert"`
- 加入警示 Icon

### FR-5: SignUpForm 使用 useCountdown

- 移除手動 setInterval 實作
- 使用 `@/components/shared/forms` 的 `useCountdown`

## 驗收標準

### 必須通過

- [ ] PasswordField 支援 error 狀態與 aria 屬性
- [ ] OtpInput 有 role="group" 與每格 aria-label
- [ ] SubmitButton 有 Loading Spinner
- [ ] FormError 有 role="alert" 與 Icon
- [ ] SignUpForm 使用 useCountdown hook
- [ ] `pnpm build` 成功
- [ ] `pnpm lint` 通過
- [ ] 現有功能不受影響

### 不改變

- 組件的基本功能
- 現有的視覺樣式（除 Loading Spinner）
- 現有的 API 接口（向後兼容）

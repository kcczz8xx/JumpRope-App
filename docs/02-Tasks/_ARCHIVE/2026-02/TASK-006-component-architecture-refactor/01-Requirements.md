# 01 - 需求規格

## 背景

目前 `src/features/auth/components/SignInForm.tsx` 有 222 行，混合了：

- UI 狀態（showPassword toggle）
- 表單狀態（phone, password）
- 驗證邏輯（isValidPhoneNumber）
- API 調用（signIn）

類似邏輯在 SignUpForm 等其他表單重複出現，缺乏統一的中間層組件。

## 問題分析

| 問題             | 影響                                                    |
| :--------------- | :------------------------------------------------------ |
| 密碼欄位 UI 重複 | SignInForm、SignUpForm、重設密碼都有相同的顯示/隱藏邏輯 |
| 錯誤顯示重複     | 每個表單都有類似的錯誤 toast/alert                      |
| 提交按鈕重複     | loading 狀態處理重複                                    |
| 缺少中間層       | `components/ui/` 太底層，`features/` 太專用             |

## 解決方案

建立 `components/shared/` 中間層：

```
components/
├── ui/           # 底層 UI（Button, Input）— 已有
├── shared/       # 【新增】跨功能共用組件
│   ├── forms/    # 表單組件
│   ├── tables/   # 表格組件
│   └── cards/    # 卡片組件
├── layout/       # 佈局 — 已有
└── tailadmin/    # Tailadmin — 已有
```

## 功能需求

### FR-1: 建立 PasswordField 組件

- 密碼輸入欄位，帶顯示/隱藏切換
- Props: `name`, `label`, `placeholder`, `value`, `onChange`
- 支援 dark mode

### FR-2: 建立 FormError 組件

- 錯誤訊息顯示
- Props: `message`
- 無訊息時不渲染

### FR-3: 建立 SubmitButton 組件

- 提交按鈕，自動處理 loading 狀態
- Props: `isLoading`, `children`, `className`

### FR-4: 建立 LoginMethodToggle 組件

- 切換選項組件（電話/會員編號）
- Props: `value`, `onChange`, `options[]`
- 泛用設計，可用於其他切換場景

### FR-5: 重構 SignInForm

- 使用上述 4 個共用組件
- 保留所有原有功能
- 目標行數 < 150 行（實際達成 124 行）

## 驗收標準

### 必須通過

- [ ] `src/components/shared/forms/` 資料夾存在
- [ ] `PasswordField.tsx` 可在多個表單使用
- [ ] `FormError.tsx` 可在多個表單使用
- [ ] `SubmitButton.tsx` 可在多個表單使用
- [ ] `LoginMethodToggle.tsx` 可在多個場景使用
- [x] `SignInForm.tsx` 124 行（超越目標）
- [ ] 登入功能正常運作
- [ ] `pnpm build` 成功
- [ ] `pnpm lint` 通過

### 不改變

- 登入流程的用戶體驗
- 現有的驗證邏輯
- 現有的樣式

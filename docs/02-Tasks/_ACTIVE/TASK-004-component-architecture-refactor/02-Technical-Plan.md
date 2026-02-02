# 02 - 技術方案

## 架構概念

### 三層組件架構

```
┌─────────────────────────────────────────────────┐
│  features/[name]/components/  （業務組件）       │
│  - 包含業務邏輯、API 調用、Zod schema           │
│  - 例：SignInForm, UserTable                    │
└─────────────────────────────────────────────────┘
                      ↓ 使用
┌─────────────────────────────────────────────────┐
│  components/shared/           （共用組件）       │
│  - 跨功能可複用，無特定業務邏輯                  │
│  - 例：PasswordField, DataTable, InfoCard       │
└─────────────────────────────────────────────────┘
                      ↓ 使用
┌─────────────────────────────────────────────────┐
│  components/ui/               （基礎 UI）        │
│  - 最底層，純 UI 原子組件                        │
│  - 例：Button, Input, Label                     │
└─────────────────────────────────────────────────┘
```

## 實作步驟

### Phase 1: 建立資料夾結構（5 分鐘）

```bash
src/components/shared/
├── forms/
│   └── index.ts
├── tables/
│   └── index.ts
└── cards/
    └── index.ts
```

### Phase 2: 建立共用組件（45 分鐘）

#### 2.1 PasswordField.tsx

```typescript
// src/components/shared/forms/PasswordField.tsx
"use client";

import { useState } from "react";
import Label from "@/components/tailadmin/form/Label";
import { EyeIcon, EyeCloseIcon } from "@/icons";

interface PasswordFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export function PasswordField({
  name,
  label,
  placeholder = "輸入密碼",
  value,
  onChange,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <Label>
        {label} <span className="text-error-500">*</span>
      </Label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
        <span
          onClick={() => setShow(!show)}
          className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
        >
          {show ? (
            <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
          ) : (
            <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
          )}
        </span>
      </div>
    </div>
  );
}
```

#### 2.2 FormError.tsx

```typescript
// src/components/shared/forms/FormError.tsx
interface FormErrorProps {
  message?: string;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
      {message}
    </div>
  );
}
```

#### 2.3 SubmitButton.tsx

```typescript
// src/components/shared/forms/SubmitButton.tsx
"use client";

import Button from "@/components/tailadmin/ui/button/Button";

interface SubmitButtonProps {
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
}

export function SubmitButton({
  isLoading = false,
  children,
  className = "w-full",
  loadingText = "處理中...",
}: SubmitButtonProps) {
  return (
    <Button type="submit" className={className} size="sm" disabled={isLoading}>
      {isLoading ? loadingText : children}
    </Button>
  );
}
```

#### 2.4 LoginMethodToggle.tsx

```typescript
// src/components/shared/forms/LoginMethodToggle.tsx
"use client";

interface ToggleOption {
  value: string;
  label: string;
}

interface LoginMethodToggleProps {
  value: string;
  onChange: (value: string) => void;
  options: ToggleOption[];
}

export function LoginMethodToggle({
  value,
  onChange,
  options,
}: LoginMethodToggleProps) {
  return (
    <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            value === option.value
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
```

#### 2.5 index.ts

```typescript
// src/components/shared/forms/index.ts
export { PasswordField } from "./PasswordField";
export { FormError } from "./FormError";
export { SubmitButton } from "./SubmitButton";
export { LoginMethodToggle } from "./LoginMethodToggle";
```

### Phase 3: 重構 SignInForm（30 分鐘）

重構後的 SignInForm 結構：

```typescript
// src/features/auth/components/SignInForm.tsx
"use client";

import {
  PasswordField,
  FormError,
  SubmitButton,
  LoginMethodToggle,
} from "@/components/shared/forms";
// ... 其他 imports

export default function SignInForm() {
  // 狀態管理保持不變
  // ...

  return (
    <div>
      {/* Header */}
      <LoginMethodToggle
        value={loginMethod}
        onChange={(value) => setLoginMethod(value as LoginMethod)}
        options={[
          { value: "phone", label: "電話號碼" },
          { value: "memberNumber", label: "會員編號" },
        ]}
      />

      <FormError message={error} />

      <form onSubmit={handleSubmit}>
        {/* 電話/會員編號輸入 */}
        <PasswordField
          name="password"
          label="密碼"
          value={password}
          onChange={setPassword}
        />
        <SubmitButton isLoading={isLoading} loadingText="登入中...">
          登入
        </SubmitButton>
      </form>
    </div>
  );
}
```

## 預期成果

| 指標            | 優化前 | 優化後 |
| :-------------- | :----- | :----- |
| SignInForm 行數 | 222    | < 150  |
| 可複用組件      | 0      | 4      |
| 重複代碼        | 高     | 低     |

## 風險與緩解

| 風險            | 緩解措施                       |
| :-------------- | :----------------------------- |
| 樣式不一致      | 直接從原始 SignInForm 複製樣式 |
| 功能缺失        | 重構後完整測試登入流程         |
| TypeScript 錯誤 | 確保 Props interface 完整      |

## 後續擴展

完成本次重構後，可繼續：

1. **重構 SignUpForm** — 使用相同共用組件
2. **建立 DataTable** — 處理 user/school-service 的表格
3. **建立 InfoCard** — 處理 dashboard 的統計卡片

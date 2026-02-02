# 02 - 技術方案

## 實作步驟

### Phase 1: PasswordField a11y 增強（45 分鐘）

```typescript
// src/components/shared/forms/PasswordField.tsx
"use client";

import { useState, useId } from "react";
import Label from "@/components/tailadmin/form/Label";
import { EyeIcon, EyeCloseIcon } from "@/icons";

interface PasswordFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string; // 新增
  disabled?: boolean; // 新增
  autoComplete?: string; // 新增
  required?: boolean; // 新增
}

export function PasswordField({
  name,
  label,
  placeholder = "輸入密碼",
  value,
  onChange,
  error,
  disabled = false,
  autoComplete = "current-password",
  required = true,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const id = useId();
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div>
      <Label htmlFor={id}>
        {label} {required && <span className="text-error-500">*</span>}
      </Label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={errorId}
          aria-required={required}
          className={`h-11 w-full rounded-lg border ${
            error
              ? "border-error-500 focus:border-error-500 focus:ring-error-500/20"
              : "border-gray-300 focus:border-brand-300 focus:ring-brand-500/20"
          } ...existing styles...`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          disabled={disabled}
          aria-label={show ? "隱藏密碼" : "顯示密碼"}
          aria-pressed={show}
          className="absolute ..."
        >
          {show ? <EyeIcon /> : <EyeCloseIcon />}
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-error-600">
          {error}
        </p>
      )}
    </div>
  );
}
```

### Phase 2: OtpInput a11y 增強（30 分鐘）

```typescript
// src/components/shared/forms/OtpInput.tsx
export interface OtpInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  error?: boolean;        // 新增
  ariaLabel?: string;     // 新增
}

export const OtpInput = forwardRef<OtpInputRef, OtpInputProps>(
  ({ ..., error = false, ariaLabel = "驗證碼" }, ref) => {
    return (
      <div role="group" aria-label={ariaLabel} className="flex gap-2">
        {value.map((digit, index) => (
          <input
            key={index}
            aria-label={`${ariaLabel}第 ${index + 1} 位`}
            aria-invalid={error}
            ...
          />
        ))}
      </div>
    );
  }
);
```

### Phase 3: SubmitButton 改用 Tailadmin Button（30 分鐘）

```typescript
// src/components/shared/forms/SubmitButton.tsx
"use client";

import Button from "@/components/tailadmin/ui/button/Button";

interface SubmitButtonProps {
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
  type?: "submit" | "button";
  onClick?: () => void;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "outline";
}

// Loading Spinner SVG
const LoadingSpinner = () => (
  <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export function SubmitButton({
  isLoading = false,
  disabled = false,
  children,
  className = "w-full",
  loadingText = "處理中...",
  type = "submit",
  onClick,
  size = "sm",
  variant = "primary",
}: SubmitButtonProps) {
  return (
    <Button
      type={type}
      onClick={onClick}
      className={className}
      size={size}
      disabled={isLoading || disabled}
      aria-busy={isLoading}
    >
      {isLoading && <LoadingSpinner />}
      {isLoading ? loadingText : children}
    </Button>
  );
}
```

### Phase 4: FormError 增強（20 分鐘）

```typescript
// src/components/shared/forms/FormError.tsx
import { cn } from "@/lib/utils";

// 內建 AlertCircle Icon
const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
    <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
    <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
  </svg>
);

export interface FormErrorProps {
  message?: string;
  className?: string;
  showIcon?: boolean;
  variant?: "inline" | "block";
}

export function FormError({
  message,
  className,
  showIcon = true,
  variant = "block",
}: FormErrorProps) {
  if (!message) return null;

  const isInline = variant === "inline";

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 text-sm text-error-600 dark:text-error-400",
        isInline
          ? "mt-1"
          : "mb-4 rounded-lg bg-error-50 p-3 dark:bg-error-500/10",
        className
      )}
    >
      {showIcon && <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />}
      <p>{message}</p>
    </div>
  );
}
```

### Phase 5: SignUpForm 使用 useCountdown（10 分鐘）

```typescript
// src/features/auth/components/SignUpForm.tsx
import { useCountdown } from "@/components/shared/forms";

export default function SignUpForm() {
  const { countdown, startCountdown } = useCountdown(60);

  // 移除原本的 setInterval 實作

  const handleSendOtp = async () => {
    // ... 發送 OTP 邏輯
    startCountdown();
  };

  // ...
}
```

## 預期成果

| 指標            | 優化前 | 優化後 |
| :-------------- | :----- | :----- |
| aria 屬性       | 0      | 10+    |
| role="alert"    | 0      | 2      |
| Loading Spinner | 無     | 有     |
| 重複代碼        | 有     | 無     |

## 風險與緩解

| 風險                   | 緩解措施                           |
| :--------------------- | :--------------------------------- |
| Props 變更破壞現有調用 | 所有新 props 有預設值，向後兼容    |
| Button 樣式差異        | 使用現有 Tailadmin Button 確保一致 |
| Icon 缺失              | 內建 SVG Icon                      |

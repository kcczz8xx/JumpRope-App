"use client";

import { memo, useCallback, useId } from "react";

import { cn } from "@/lib/utils";

import { FIELD_STYLES } from "../styles";
import type { FieldProps } from "../types";

export interface PhoneFieldProps extends FieldProps<string> {
  /** 顯示國碼前綴（預設：false） */
  showCountryCode?: boolean;
  /** 國碼（預設：+852） */
  countryCode?: string;
}

/**
 * 電話號碼欄位
 *
 * @description 支援 edit/readonly/compact 三種模式
 * @example
 * ```tsx
 * <PhoneField
 *   value={phone}
 *   onChange={setPhone}
 *   label="電話號碼"
 *   required
 *   error={errors.phone?.message}
 * />
 * ```
 */
export const PhoneField = memo(function PhoneField({
  // 1️⃣ 數據
  value,
  onChange,
  // 2️⃣ 顯示模式
  mode = "edit",
  // 3️⃣ 狀態
  error,
  disabled,
  required,
  // 4️⃣ 標籤和提示
  label,
  placeholder = "電話號碼",
  hint,
  // 5️⃣ 樣式和擴展
  className,
  id: propId,
  // 額外 props
  showCountryCode = false,
  countryCode = "+852",
}: PhoneFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleaned = e.target.value.replace(/[^\d+\s-]/g, "");
      onChange?.(cleaned);
    },
    [onChange]
  );

  const formatDisplayValue = (val: string) => {
    if (!val) return "";
    if (showCountryCode && !val.startsWith("+")) {
      return `${countryCode} ${val}`;
    }
    return val;
  };

  // Readonly 模式
  if (mode === "readonly") {
    return (
      <div className={className}>
        {label && <span className={FIELD_STYLES.label.base}>{label}</span>}
        <p
          className={cn(
            FIELD_STYLES.readonly.base,
            !value && FIELD_STYLES.readonly.empty
          )}
        >
          {value ? formatDisplayValue(value) : "未填寫"}
        </p>
      </div>
    );
  }

  // Compact 模式
  if (mode === "compact") {
    return (
      <span className={cn(FIELD_STYLES.compact.base, className)}>
        {value ? formatDisplayValue(value) : "-"}
      </span>
    );
  }

  // Edit 模式
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            FIELD_STYLES.label.base,
            required && FIELD_STYLES.label.required
          )}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {showCountryCode && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
            {countryCode}
          </span>
        )}
        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            FIELD_STYLES.input.base,
            error && FIELD_STYLES.input.error,
            disabled && FIELD_STYLES.input.disabled,
            showCountryCode && "pl-14"
          )}
        />
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className={FIELD_STYLES.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={FIELD_STYLES.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

"use client";

import { memo, useCallback, useId } from "react";

import { cn } from "@/lib/utils";

import { FIELD_STYLES } from "../styles";
import type { FieldProps } from "../types";

export interface CurrencyFieldProps extends FieldProps<string> {
  /** 貨幣符號（預設：HK$） */
  currencySymbol?: string;
  /** 小數位數（預設：2） */
  decimalPlaces?: number;
}

/**
 * 金額欄位
 *
 * @description 支援 edit/readonly/compact 三種模式
 * @example
 * ```tsx
 * <CurrencyField
 *   value={amount}
 *   onChange={setAmount}
 *   label="金額"
 *   required
 *   error={errors.amount?.message}
 * />
 * ```
 */
export const CurrencyField = memo(function CurrencyField({
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
  placeholder = "0.00",
  hint,
  // 5️⃣ 樣式和擴展
  className,
  id: propId,
  // 額外 props
  currencySymbol = "HK$",
  decimalPlaces = 2,
}: CurrencyFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const regex = new RegExp(`^\\d*\\.?\\d{0,${decimalPlaces}}$`);
      if (input === "" || regex.test(input)) {
        onChange?.(input);
      }
    },
    [onChange, decimalPlaces]
  );

  const formatDisplayValue = (val: string) => {
    if (!val) return "";
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return `${currencySymbol} ${num.toLocaleString("en-HK", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    })}`;
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
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
          {currencySymbol}
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
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
            "pl-12 text-right"
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

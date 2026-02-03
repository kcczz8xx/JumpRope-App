"use client";

import { memo, useCallback, useId } from "react";

import { cn } from "@/lib/utils";

import { FIELD_STYLES } from "../styles";
import type { NullableFieldProps } from "../types";

export interface DateFieldProps extends NullableFieldProps<string> {
  /** 最小日期（YYYY-MM-DD） */
  min?: string;
  /** 最大日期（YYYY-MM-DD） */
  max?: string;
}

/**
 * 日期選擇欄位
 *
 * @description 支援 edit/readonly/compact 三種模式
 * @example
 * ```tsx
 * <DateField
 *   value={date}
 *   onChange={setDate}
 *   label="日期"
 *   required
 *   error={errors.date?.message}
 * />
 * ```
 */
export const DateField = memo(function DateField({
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
  placeholder = "選擇日期",
  hint,
  // 5️⃣ 樣式和擴展
  className,
  id: propId,
  // 額外 props
  min,
  max,
}: DateFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value || null);
    },
    [onChange]
  );

  const formatDisplayValue = (val: string | null) => {
    if (!val) return "";
    const date = new Date(val);
    if (isNaN(date.getTime())) return val;
    return date.toLocaleDateString("zh-HK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
          {value ? formatDisplayValue(value) : "未選擇"}
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
      <input
        id={id}
        type="date"
        value={value ?? ""}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        min={min}
        max={max}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(
          FIELD_STYLES.input.base,
          error && FIELD_STYLES.input.error,
          disabled && FIELD_STYLES.input.disabled
        )}
      />
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

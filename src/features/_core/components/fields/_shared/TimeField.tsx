"use client";

import { memo, useCallback, useId } from "react";

import { cn } from "@/lib/utils";

import { FIELD_STYLES } from "../styles";
import type { NullableFieldProps } from "../types";

export interface TimeFieldProps extends NullableFieldProps<string> {
  /** 時間間隔（分鐘，預設：1） */
  step?: number;
  /** 最小時間（HH:mm） */
  min?: string;
  /** 最大時間（HH:mm） */
  max?: string;
}

/**
 * 時間選擇欄位
 *
 * @description 支援 edit/readonly/compact 三種模式，格式為 HH:mm
 * @example
 * ```tsx
 * <TimeField
 *   value={time}
 *   onChange={setTime}
 *   label="時間"
 *   step={15}
 *   required
 *   error={errors.time?.message}
 * />
 * ```
 */
export const TimeField = memo(function TimeField({
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
  placeholder = "選擇時間",
  hint,
  // 5️⃣ 樣式和擴展
  className,
  id: propId,
  // 額外 props
  step = 1,
  min,
  max,
}: TimeFieldProps) {
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
    const [hours, minutes] = val.split(":");
    const h = parseInt(hours, 10);
    const period = h >= 12 ? "下午" : "上午";
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${period} ${displayHour}:${minutes}`;
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
        type="time"
        value={value ?? ""}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        step={step * 60}
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

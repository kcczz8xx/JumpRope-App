"use client";

import { memo, useCallback, useId } from "react";

import { cn } from "@/lib/utils";

import { FIELD_STYLES } from "../styles";
import type { BaseFieldProps } from "../types";

export interface DateRangeValue {
  startDate: string | null;
  endDate: string | null;
}

export interface DateRangeFieldProps extends BaseFieldProps {
  value: DateRangeValue;
  onChange?: (value: DateRangeValue) => void;
  /** 開始日期標籤 */
  startLabel?: string;
  /** 結束日期標籤 */
  endLabel?: string;
  /** 最小日期 */
  min?: string;
  /** 最大日期 */
  max?: string;
}

/**
 * 日期範圍欄位
 *
 * @description 支援 edit/readonly/compact 三種模式
 * @example
 * ```tsx
 * <DateRangeField
 *   value={{ startDate, endDate }}
 *   onChange={({ startDate, endDate }) => { ... }}
 *   label="課程日期"
 *   required
 * />
 * ```
 */
export const DateRangeField = memo(function DateRangeField({
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
  hint,
  // 5️⃣ 樣式和擴展
  className,
  id: propId,
  // 額外 props
  startLabel = "開始日期",
  endLabel = "結束日期",
  min,
  max,
}: DateRangeFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;

  const handleStartChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.({ ...value, startDate: e.target.value || null });
    },
    [onChange, value]
  );

  const handleEndChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.({ ...value, endDate: e.target.value || null });
    },
    [onChange, value]
  );

  const formatDate = (val: string | null) => {
    if (!val) return "";
    const date = new Date(val);
    if (isNaN(date.getTime())) return val;
    return date.toLocaleDateString("zh-HK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Readonly 模式
  if (mode === "readonly") {
    const hasValue = value.startDate || value.endDate;
    return (
      <div className={className}>
        {label && <span className={FIELD_STYLES.label.base}>{label}</span>}
        <p
          className={cn(
            FIELD_STYLES.readonly.base,
            !hasValue && FIELD_STYLES.readonly.empty
          )}
        >
          {hasValue
            ? `${formatDate(value.startDate) || "未定"} — ${formatDate(value.endDate) || "未定"}`
            : "未選擇"}
        </p>
      </div>
    );
  }

  // Compact 模式
  if (mode === "compact") {
    const hasValue = value.startDate || value.endDate;
    return (
      <span className={cn(FIELD_STYLES.compact.base, className)}>
        {hasValue
          ? `${formatDate(value.startDate) || "-"} — ${formatDate(value.endDate) || "-"}`
          : "-"}
      </span>
    );
  }

  // Edit 模式
  return (
    <div className={className}>
      {label && (
        <span
          className={cn(
            FIELD_STYLES.label.base,
            required && FIELD_STYLES.label.required
          )}
        >
          {label}
        </span>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor={`${id}-start`}
            className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
          >
            {startLabel}
          </label>
          <input
            id={`${id}-start`}
            type="date"
            value={value.startDate ?? ""}
            onChange={handleStartChange}
            disabled={disabled}
            min={min}
            max={value.endDate ?? max}
            aria-invalid={!!error}
            className={cn(
              FIELD_STYLES.input.base,
              error && FIELD_STYLES.input.error,
              disabled && FIELD_STYLES.input.disabled
            )}
          />
        </div>
        <div>
          <label
            htmlFor={`${id}-end`}
            className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
          >
            {endLabel}
          </label>
          <input
            id={`${id}-end`}
            type="date"
            value={value.endDate ?? ""}
            onChange={handleEndChange}
            disabled={disabled}
            min={value.startDate ?? min}
            max={max}
            aria-invalid={!!error}
            className={cn(
              FIELD_STYLES.input.base,
              error && FIELD_STYLES.input.error,
              disabled && FIELD_STYLES.input.disabled
            )}
          />
        </div>
      </div>
      {hint && !error && (
        <p className={cn(FIELD_STYLES.hint, "mt-1")}>{hint}</p>
      )}
      {error && (
        <p className={cn(FIELD_STYLES.error, "mt-1")} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

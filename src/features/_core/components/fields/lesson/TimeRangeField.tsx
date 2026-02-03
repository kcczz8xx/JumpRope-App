"use client";

import { memo, useCallback, useId } from "react";

import { cn } from "@/lib/utils";

import { FIELD_STYLES } from "../styles";
import type { BaseFieldProps } from "../types";

export interface TimeRangeValue {
  startTime: string | null;
  endTime: string | null;
}

export interface TimeRangeFieldProps extends BaseFieldProps {
  value: TimeRangeValue;
  onChange?: (value: TimeRangeValue) => void;
  /** 開始時間標籤 */
  startLabel?: string;
  /** 結束時間標籤 */
  endLabel?: string;
  /** 時間間隔（分鐘，預設：15） */
  step?: number;
}

/**
 * 時間範圍欄位
 *
 * @description 支援 edit/readonly/compact 三種模式
 * @example
 * ```tsx
 * <TimeRangeField
 *   value={{ startTime, endTime }}
 *   onChange={({ startTime, endTime }) => { ... }}
 *   label="上課時間"
 *   step={15}
 *   required
 * />
 * ```
 */
export const TimeRangeField = memo(function TimeRangeField({
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
  startLabel = "開始時間",
  endLabel = "結束時間",
  step = 15,
}: TimeRangeFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;

  const handleStartChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.({ ...value, startTime: e.target.value || null });
    },
    [onChange, value]
  );

  const handleEndChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.({ ...value, endTime: e.target.value || null });
    },
    [onChange, value]
  );

  const formatTime = (val: string | null) => {
    if (!val) return "";
    const [hours, minutes] = val.split(":");
    const h = parseInt(hours, 10);
    const period = h >= 12 ? "下午" : "上午";
    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${period} ${displayHour}:${minutes}`;
  };

  // Readonly 模式
  if (mode === "readonly") {
    const hasValue = value.startTime || value.endTime;
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
            ? `${formatTime(value.startTime) || "未定"} — ${formatTime(value.endTime) || "未定"}`
            : "未選擇"}
        </p>
      </div>
    );
  }

  // Compact 模式
  if (mode === "compact") {
    const hasValue = value.startTime || value.endTime;
    return (
      <span className={cn(FIELD_STYLES.compact.base, className)}>
        {hasValue
          ? `${formatTime(value.startTime) || "-"} — ${formatTime(value.endTime) || "-"}`
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
            type="time"
            value={value.startTime ?? ""}
            onChange={handleStartChange}
            disabled={disabled}
            step={step * 60}
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
            type="time"
            value={value.endTime ?? ""}
            onChange={handleEndChange}
            disabled={disabled}
            step={step * 60}
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

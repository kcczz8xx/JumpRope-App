"use client";

import { memo, useCallback, useId } from "react";

import { cn } from "@/lib/utils";

import { FIELD_STYLES } from "../styles";
import type { FieldProps } from "../types";

export interface EnglishNameFieldProps extends FieldProps<string> {}

/**
 * 英文姓名欄位
 *
 * @description 支援 edit/readonly/compact 三種模式
 * @example
 * ```tsx
 * <EnglishNameField
 *   value={nameEnglish}
 *   onChange={setNameEnglish}
 *   label="英文姓名"
 *   required
 *   error={errors.nameEnglish?.message}
 * />
 * ```
 */
export const EnglishNameField = memo(function EnglishNameField({
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
  placeholder = "English Name",
  hint,
  // 5️⃣ 樣式和擴展
  className,
  id: propId,
}: EnglishNameFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    },
    [onChange]
  );

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
          {value || "未填寫"}
        </p>
      </div>
    );
  }

  // Compact 模式
  if (mode === "compact") {
    return (
      <span className={cn(FIELD_STYLES.compact.base, className)}>
        {value || "-"}
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
        type="text"
        autoComplete="name"
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
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

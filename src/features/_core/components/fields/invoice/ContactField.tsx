"use client";

import { memo, useCallback, useId } from "react";

import { cn } from "@/lib/utils";

import { FIELD_STYLES } from "../styles";
import type { BaseFieldProps } from "../types";

export interface ContactValue {
  name: string;
  phone: string;
  email: string;
}

export interface ContactFieldProps extends BaseFieldProps {
  value: ContactValue;
  onChange?: (value: ContactValue) => void;
  /** 姓名標籤 */
  nameLabel?: string;
  /** 電話標籤 */
  phoneLabel?: string;
  /** 電郵標籤 */
  emailLabel?: string;
  /** 姓名佔位符 */
  namePlaceholder?: string;
  /** 電話佔位符 */
  phonePlaceholder?: string;
  /** 電郵佔位符 */
  emailPlaceholder?: string;
}

/**
 * 聯絡人欄位（複合）
 *
 * @description 包含姓名、電話、電郵的複合欄位，支援 edit/readonly/compact 三種模式
 * @example
 * ```tsx
 * <ContactField
 *   value={{ name, phone, email }}
 *   onChange={({ name, phone, email }) => { ... }}
 *   label="聯絡人"
 *   required
 * />
 * ```
 */
export const ContactField = memo(function ContactField({
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
  nameLabel = "姓名",
  phoneLabel = "電話",
  emailLabel = "電郵",
  namePlaceholder = "聯絡人姓名",
  phonePlaceholder = "電話號碼",
  emailPlaceholder = "電郵地址",
}: ContactFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.({ ...value, name: e.target.value });
    },
    [onChange, value]
  );

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleaned = e.target.value.replace(/[^\d+\s-]/g, "");
      onChange?.({ ...value, phone: cleaned });
    },
    [onChange, value]
  );

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.({ ...value, email: e.target.value });
    },
    [onChange, value]
  );

  // Readonly 模式
  if (mode === "readonly") {
    const hasValue = value.name || value.phone || value.email;
    return (
      <div className={className}>
        {label && <span className={FIELD_STYLES.label.base}>{label}</span>}
        {hasValue ? (
          <div className="space-y-1">
            {value.name && (
              <p className={FIELD_STYLES.readonly.base}>{value.name}</p>
            )}
            {value.phone && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                📞 {value.phone}
              </p>
            )}
            {value.email && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ✉️ {value.email}
              </p>
            )}
          </div>
        ) : (
          <p className={FIELD_STYLES.readonly.empty}>未填寫</p>
        )}
      </div>
    );
  }

  // Compact 模式
  if (mode === "compact") {
    const parts = [value.name, value.phone].filter(Boolean);
    return (
      <span className={cn(FIELD_STYLES.compact.base, className)}>
        {parts.length > 0 ? parts.join(" · ") : "-"}
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
      <div className="space-y-3">
        <div>
          <label
            htmlFor={`${id}-name`}
            className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
          >
            {nameLabel}
          </label>
          <input
            id={`${id}-name`}
            type="text"
            value={value.name}
            onChange={handleNameChange}
            disabled={disabled}
            placeholder={namePlaceholder}
            aria-invalid={!!error}
            className={cn(
              FIELD_STYLES.input.base,
              error && FIELD_STYLES.input.error,
              disabled && FIELD_STYLES.input.disabled
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor={`${id}-phone`}
              className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
            >
              {phoneLabel}
            </label>
            <input
              id={`${id}-phone`}
              type="tel"
              inputMode="tel"
              value={value.phone}
              onChange={handlePhoneChange}
              disabled={disabled}
              placeholder={phonePlaceholder}
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
              htmlFor={`${id}-email`}
              className="block text-xs text-gray-500 dark:text-gray-400 mb-1"
            >
              {emailLabel}
            </label>
            <input
              id={`${id}-email`}
              type="email"
              inputMode="email"
              value={value.email}
              onChange={handleEmailChange}
              disabled={disabled}
              placeholder={emailPlaceholder}
              aria-invalid={!!error}
              className={cn(
                FIELD_STYLES.input.base,
                error && FIELD_STYLES.input.error,
                disabled && FIELD_STYLES.input.disabled
              )}
            />
          </div>
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

/**
 * Enum Config Types
 *
 * Single Source of Truth for Enum configurations
 */

import type { BadgeColor } from "@/features/_core/components/fields/styles";

/**
 * Enum 選項定義
 */
export interface EnumOption<T extends string> {
  value: T;
  label: string;
  color: BadgeColor;
  description?: string;
  disabled?: boolean;
}

/**
 * Enum 配置定義
 */
export interface EnumConfig<T extends string> {
  values: readonly T[];
  options: EnumOption<T>[];
  default?: T;
}

/**
 * Enum Helpers 返回類型
 */
export interface EnumHelpers<T extends string> {
  schema: import("zod").ZodType<T>;
  optionalSchema: import("zod").ZodType<T | undefined>;
  getLabel: (value: T) => string;
  getColor: (value: T) => BadgeColor;
  getOptions: () => EnumOption<T>[];
  getDefault: () => T | undefined;
  values: readonly T[];
}

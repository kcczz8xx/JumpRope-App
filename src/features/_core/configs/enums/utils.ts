/**
 * Enum Config Utilities
 *
 * Factory function to create enum helpers from config
 */

import { z } from "zod";
import type { BadgeColor } from "@/features/_core/components/fields/styles";
import type { EnumConfig, EnumHelpers, EnumOption } from "./types";

/**
 * 從 EnumConfig 創建所有需要的工具函數
 *
 * @example
 * ```ts
 * import { CourseStatus } from "@prisma/client";
 *
 * const helpers = createEnumHelpers(COURSE_STATUS_CONFIG);
 * helpers.getLabel(CourseStatus.DRAFT); // "草稿"
 * helpers.getColor(CourseStatus.ACTIVE); // "green"
 * ```
 */
export function createEnumHelpers<T extends string>(
  config: EnumConfig<T>
): EnumHelpers<T> {
  const schema = z.enum(config.values as [T, ...T[]]);
  const optionalSchema = schema.optional();

  const getLabel = (value: T): string => {
    return config.options.find((opt) => opt.value === value)?.label ?? value;
  };

  const getColor = (value: T): BadgeColor => {
    return config.options.find((opt) => opt.value === value)?.color ?? "gray";
  };

  const getOptions = (): EnumOption<T>[] => {
    return config.options;
  };

  const getDefault = (): T | undefined => {
    return config.default;
  };

  return {
    schema,
    optionalSchema,
    getLabel,
    getColor,
    getOptions,
    getDefault,
    values: config.values,
  };
}

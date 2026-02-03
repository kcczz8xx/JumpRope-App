/**
 * 原子化欄位系統 - 公開 API
 *
 * @description 統一導出所有欄位組件和類型
 * @see docs/02-Tasks/_ACTIVE/TASK-0010-atomic-field-system/02-Technical-Plan.md
 *
 * 使用方式：
 * ```typescript
 * import { PhoneField, FIELD_STYLES, type FieldProps } from "@/features/_core";
 * ```
 */

// 類型定義
export type {
  FieldMode,
  BaseFieldProps,
  FieldProps,
  NullableFieldProps,
  EnumOption,
} from "./types";

// 樣式常數
export { FIELD_STYLES, type BadgeColor } from "./styles";

// ============================================================
// 欄位組件（Phase 1+ 逐步添加）
// ============================================================

// Phase 1: 共用欄位（_shared/）
export { PhoneField, type PhoneFieldProps } from "./_shared/PhoneField";
export { EmailField, type EmailFieldProps } from "./_shared/EmailField";
export { ChineseNameField, type ChineseNameFieldProps } from "./_shared/ChineseNameField";
export { EnglishNameField, type EnglishNameFieldProps } from "./_shared/EnglishNameField";
export { CurrencyField, type CurrencyFieldProps } from "./_shared/CurrencyField";
export { RemarksField, type RemarksFieldProps } from "./_shared/RemarksField";

// Phase 2: 日期時間欄位（_shared/）
export { DateField, type DateFieldProps } from "./_shared/DateField";
export { TimeField, type TimeFieldProps } from "./_shared/TimeField";

// Phase 2: 日期時間欄位（course/）
export { DateRangeField, type DateRangeFieldProps, type DateRangeValue } from "./course/DateRangeField";
export { AcademicYearField, type AcademicYearFieldProps } from "./course/AcademicYearField";

// Phase 2: 日期時間欄位（lesson/）
export { TimeRangeField, type TimeRangeFieldProps, type TimeRangeValue } from "./lesson/TimeRangeField";

// Phase 3: Enum 工廠
export { createEnumField } from "./_enum/factory";

// Phase 6: Enum Configs（Single Source of Truth）
// 改用 @/features/_core/configs/enums 導入

// Phase 3: School 欄位（school/）
export { PartnershipStatusField } from "./school/PartnershipStatusField";

// Phase 3: Course 欄位（course/）
export { CourseStatusField } from "./course/CourseStatusField";
export { CourseTermField } from "./course/CourseTermField";
export { ChargingModelField } from "./course/ChargingModelField";

// Phase 3: Lesson 欄位（lesson/）
export { LessonStatusField } from "./lesson/LessonStatusField";
export { LessonTypeField } from "./lesson/LessonTypeField";

// Phase 3: Invoice 欄位（invoice/）
export { InvoiceStatusField } from "./invoice/InvoiceStatusField";
export { PaymentMethodField } from "./invoice/PaymentMethodField";

// Phase 4: 複合欄位
export { ContactField, type ContactFieldProps, type ContactValue } from "./invoice/ContactField";
export { SchoolContactField, type SchoolContactFieldProps, type SchoolContactValue } from "./school/SchoolContactField";
export { AddressField, type AddressFieldProps, type AddressValue } from "./school/AddressField";

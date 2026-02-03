/**
 * 共用 Zod Schemas - 公開 API
 *
 * @description 統一導出所有欄位驗證 Schema
 */

// Phone
export {
  phoneSchema,
  phoneOptionalSchema,
  phoneInternationalSchema,
  phoneInternationalOptionalSchema,
  type Phone,
} from "./phone.schema";

// Email
export {
  emailSchema,
  emailOptionalSchema,
  type Email,
} from "./email.schema";

// Name
export {
  chineseNameSchema,
  chineseNameOptionalSchema,
  englishNameSchema,
  englishNameOptionalSchema,
  nameSchema,
  nameOptionalSchema,
  type ChineseName,
  type EnglishName,
  type Name,
} from "./name.schema";

// Currency
export {
  currencySchema,
  currencyOptionalSchema,
  currencyNumberSchema,
  currencyNumberOptionalSchema,
  type Currency,
  type CurrencyNumber,
} from "./currency.schema";

// Date & Time
export {
  dateSchema,
  dateOptionalSchema,
  timeSchema,
  timeOptionalSchema,
  dateRangeSchema,
  timeRangeSchema,
  academicYearSchema,
  type DateString,
  type TimeString,
  type DateRange,
  type TimeRange,
  type AcademicYear,
} from "./date.schema";

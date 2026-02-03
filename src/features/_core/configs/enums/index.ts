/**
 * Enum Configs - Single Source of Truth
 *
 * 所有 Enum 的統一配置和工具函數
 *
 * @example
 * ```ts
 * import {
 *   COURSE_STATUS_CONFIG,
 *   CourseStatusHelpers,
 *   getCourseStatusLabel,
 * } from "@/features/_core/configs/enums";
 * ```
 */

// ===== Types =====
export type { EnumConfig, EnumOption, EnumHelpers } from "./types";

// ===== Utils =====
export { createEnumHelpers } from "./utils";

// ===== Configs =====
export { COURSE_STATUS_CONFIG } from "./course-status.config";
export { COURSE_TERM_CONFIG } from "./course-term.config";
export { LESSON_STATUS_CONFIG } from "./lesson-status.config";
export { LESSON_TYPE_CONFIG } from "./lesson-type.config";
export { INVOICE_STATUS_CONFIG } from "./invoice-status.config";
export { PAYMENT_METHOD_CONFIG } from "./payment-method.config";
export { PAYMENT_STATUS_CONFIG } from "./payment-status.config";
export { PARTNERSHIP_STATUS_CONFIG } from "./partnership-status.config";
export { CHARGING_MODEL_CONFIG } from "./charging-model.config";
export { TUTOR_ROLE_CONFIG } from "./tutor-role.config";
export { USER_ROLE_CONFIG } from "./user-role.config";
export { GENDER_CONFIG } from "./gender.config";

// ===== Pre-built Helpers =====
import { createEnumHelpers } from "./utils";
import { COURSE_STATUS_CONFIG } from "./course-status.config";
import { COURSE_TERM_CONFIG } from "./course-term.config";
import { LESSON_STATUS_CONFIG } from "./lesson-status.config";
import { LESSON_TYPE_CONFIG } from "./lesson-type.config";
import { INVOICE_STATUS_CONFIG } from "./invoice-status.config";
import { PAYMENT_METHOD_CONFIG } from "./payment-method.config";
import { PAYMENT_STATUS_CONFIG } from "./payment-status.config";
import { PARTNERSHIP_STATUS_CONFIG } from "./partnership-status.config";
import { CHARGING_MODEL_CONFIG } from "./charging-model.config";
import { TUTOR_ROLE_CONFIG } from "./tutor-role.config";
import { USER_ROLE_CONFIG } from "./user-role.config";
import { GENDER_CONFIG } from "./gender.config";

export const CourseStatusHelpers = createEnumHelpers(COURSE_STATUS_CONFIG);
export const CourseTermHelpers = createEnumHelpers(COURSE_TERM_CONFIG);
export const LessonStatusHelpers = createEnumHelpers(LESSON_STATUS_CONFIG);
export const LessonTypeHelpers = createEnumHelpers(LESSON_TYPE_CONFIG);
export const InvoiceStatusHelpers = createEnumHelpers(INVOICE_STATUS_CONFIG);
export const PaymentMethodHelpers = createEnumHelpers(PAYMENT_METHOD_CONFIG);
export const PaymentStatusHelpers = createEnumHelpers(PAYMENT_STATUS_CONFIG);
export const PartnershipStatusHelpers = createEnumHelpers(PARTNERSHIP_STATUS_CONFIG);
export const ChargingModelHelpers = createEnumHelpers(CHARGING_MODEL_CONFIG);
export const TutorRoleHelpers = createEnumHelpers(TUTOR_ROLE_CONFIG);
export const UserRoleHelpers = createEnumHelpers(USER_ROLE_CONFIG);
export const GenderHelpers = createEnumHelpers(GENDER_CONFIG);

// ===== Convenience Exports =====
export const {
  schema: courseStatusSchema,
  getLabel: getCourseStatusLabel,
  getColor: getCourseStatusColor,
  getOptions: getCourseStatusOptions,
} = CourseStatusHelpers;

export const {
  schema: courseTermSchema,
  getLabel: getCourseTermLabel,
  getColor: getCourseTermColor,
  getOptions: getCourseTermOptions,
} = CourseTermHelpers;

export const {
  schema: lessonStatusSchema,
  getLabel: getLessonStatusLabel,
  getColor: getLessonStatusColor,
  getOptions: getLessonStatusOptions,
} = LessonStatusHelpers;

export const {
  schema: lessonTypeSchema,
  getLabel: getLessonTypeLabel,
  getColor: getLessonTypeColor,
  getOptions: getLessonTypeOptions,
} = LessonTypeHelpers;

export const {
  schema: invoiceStatusSchema,
  getLabel: getInvoiceStatusLabel,
  getColor: getInvoiceStatusColor,
  getOptions: getInvoiceStatusOptions,
} = InvoiceStatusHelpers;

export const {
  schema: paymentMethodSchema,
  getLabel: getPaymentMethodLabel,
  getColor: getPaymentMethodColor,
  getOptions: getPaymentMethodOptions,
} = PaymentMethodHelpers;

export const {
  schema: paymentStatusSchema,
  getLabel: getPaymentStatusLabel,
  getColor: getPaymentStatusColor,
  getOptions: getPaymentStatusOptions,
} = PaymentStatusHelpers;

export const {
  schema: partnershipStatusSchema,
  getLabel: getPartnershipStatusLabel,
  getColor: getPartnershipStatusColor,
  getOptions: getPartnershipStatusOptions,
} = PartnershipStatusHelpers;

export const {
  schema: chargingModelSchema,
  getLabel: getChargingModelLabel,
  getColor: getChargingModelColor,
  getOptions: getChargingModelOptions,
} = ChargingModelHelpers;

export const {
  schema: tutorRoleSchema,
  getLabel: getTutorRoleLabel,
  getColor: getTutorRoleColor,
  getOptions: getTutorRoleOptions,
} = TutorRoleHelpers;

export const {
  schema: userRoleSchema,
  getLabel: getUserRoleLabel,
  getColor: getUserRoleColor,
  getOptions: getUserRoleOptions,
} = UserRoleHelpers;

export const {
  schema: genderSchema,
  getLabel: getGenderLabel,
  getColor: getGenderColor,
  getOptions: getGenderOptions,
} = GenderHelpers;

// ===== Re-export Prisma Enums =====
export {
  CourseStatus,
  CourseTerm,
  LessonStatus,
  LessonType,
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  PartnershipStatus,
  ChargingModel,
  TutorRole,
  UserRole,
  Gender,
} from "@prisma/client";

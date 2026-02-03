/**
 * School Service Components - Index
 * 統一導出所有學校服務相關元件
 */

// ===== Common =====
export { FormField, AmountInput } from "./common";

// ===== Overview =====
export { ActivityTimeline, MetricCards, QuickActions } from "./overview";

// ===== New Course Form =====
export {
  NewCourseForm,
  SchoolFormStep,
  CoursesFormStep,
  SummaryFormStep,
  SchoolBasicInfoCard,
  PartnershipInfoCard,
  ContactInfoCard,
  CourseItemCard,
  ChargingFieldsRenderer,
  useNewCourseFormValidation,
} from "./new-course";

// ===== School Detail =====
export {
  SchoolInfoCards,
  SchoolBasicInfoSection,
  PartnershipInfoSection,
  YearSelect,
} from "./school-detail";
export type {
  SchoolInfoCardsProps,
  SchoolBasicInfo,
  PartnershipInfo,
  AcademicYearData,
} from "./school-detail";

// ===== Course Detail =====
export {
  CourseCards,
  CourseCardItem,
  AddCourseModal,
} from "./course-detail";
export type {
  CourseCardsProps,
  CourseData,
  LessonStats,
} from "./course-detail";

// ===== List =====
export { CourseList, LessonList } from "./list";

// ===== Types =====
export * from "./types";

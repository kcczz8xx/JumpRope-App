/**
 * New Course Components - Index
 * 新增課程表單元件
 *
 * 目錄結構：
 * ├── steps/    - 多步驟表單容器
 * ├── cards/    - 表單卡片元件
 * └── hooks/    - 表單相關 Hooks
 */

// ===== Main Form =====
export { default as NewCourseForm } from "./NewCourseForm";

// ===== Steps =====
export { SchoolFormStep, CoursesFormStep, SummaryFormStep } from "./steps";

// ===== Cards =====
export {
    SchoolBasicInfoCard,
    PartnershipInfoCard,
    ContactInfoCard,
    CourseItemCard,
    ChargingFieldsRenderer,
} from "./cards";

// ===== Hooks =====
export { useNewCourseFormValidation } from "./hooks";

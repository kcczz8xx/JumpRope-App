/**
 * School Service Feature - 學校服務模組
 * 公開 API
 *
 * ✅ 允許 import：Client Components、Server Components、頁面
 * ❌ 禁止 import：其他 features（用 Dependency Injection）
 *
 * Server-only exports 請用：
 * import { ... } from '@/features/school-service/server'
 */

// ===== Components - Course =====
export { default as NewCourseForm } from "./components/course/NewCourseForm";

// ===== Components - Common =====
export { default as FormField } from "./components/common/FormField";
export { default as AmountInput } from "./components/common/AmountInput";

// ===== Components - List =====
export { LessonList } from "./components/list/LessonList";
export { CourseList } from "./components/list/CourseList";

// ===== Components - Pages =====
export { SchoolInfoCards } from "./components/pages/detailed/SchoolInfoCards";
export { CourseCards } from "./components/pages/detailed/CourseCards";
export { MetricCards } from "./components/pages/overview/MetricCards";
export { QuickActions } from "./components/pages/overview/QuickActions";
export { ActivityTimeline } from "./components/pages/overview/ActivityTimeline";

// ===== Server Actions =====
export {
    createSchoolAction,
    updateSchoolAction,
    deleteSchoolAction,
    createCourseAction,
    deleteCourseAction,
    batchCreateWithSchoolAction,
} from "./actions";

// ===== Queries =====
// 注意：Queries 也可透過 server.ts 導入（僅限 Server Components）
export {
    getSchoolsAction,
    getSchoolByIdAction,
    getCoursesAction,
    getCourseByIdAction,
} from "./queries";

// ===== Schemas =====
export {
    createSchoolSchema,
    updateSchoolSchema,
    schoolContactSchema,
    createCourseSchema,
    updateCourseSchema,
    batchCreateWithSchoolSchema,
} from "./schemas";

// ===== Types =====
export type {
    CreateSchoolInput,
    UpdateSchoolInput,
    SchoolContactInput,
    CreateCourseInput,
    UpdateCourseInput,
    BatchCreateWithSchoolInput,
} from "./schemas";

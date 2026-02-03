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

// ===== Components =====
export {
    // Common
    FormField,
    AmountInput,
    // Overview
    ActivityTimeline,
    MetricCards,
    QuickActions,
    // New Course
    NewCourseForm,
    // School Detail
    SchoolInfoCards,
    // Course Detail
    CourseCards,
    // List
    CourseList,
    LessonList,
} from "./components";

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

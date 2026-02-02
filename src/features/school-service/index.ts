/**
 * School Service Feature - 學校服務模組
 * 公開 API
 */

// Components - Course
export { default as NewCourseForm } from "./components/course/NewCourseForm";

// Components - Common
export { default as FormField } from "./components/common/FormField";
export { default as AmountInput } from "./components/common/AmountInput";

// Components - List
export { LessonList } from "./components/list/LessonList";
export { CourseList } from "./components/list/CourseList";

// Components - Pages
export { SchoolInfoCards } from "./components/pages/detailed/SchoolInfoCards";
export { CourseCards } from "./components/pages/detailed/CourseCards";
export { MetricCards } from "./components/pages/overview/MetricCards";
export { QuickActions } from "./components/pages/overview/QuickActions";
export { ActivityTimeline } from "./components/pages/overview/ActivityTimeline";

// Actions
export {
    createSchoolAction,
    updateSchoolAction,
    deleteSchoolAction,
    createCourseAction,
    deleteCourseAction,
    batchCreateWithSchoolAction,
} from "./actions";

// Queries
export {
    getSchools,
    getSchoolById,
    getCourses,
    getCourseById,
} from "./queries";

// Schemas
export {
    createSchoolSchema,
    updateSchoolSchema,
    schoolContactSchema,
    createCourseSchema,
    updateCourseSchema,
    batchCreateWithSchoolSchema,
} from "./schema";

// Types
export type {
    CreateSchoolInput,
    UpdateSchoolInput,
    SchoolContactInput,
    CreateCourseInput,
    UpdateCourseInput,
    BatchCreateWithSchoolInput,
} from "./schema";

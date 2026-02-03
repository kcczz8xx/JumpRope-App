/**
 * School Service Components - Shared Types
 *
 * 共用型別定義，供各子目錄元件使用
 * 
 * ⚠️ Enums 和常數從 schemas/common.ts 導入（Single Source of Truth）
 * 此檔案只保留：UI Labels、Helper functions、純 UI 相關 types
 */

// ===== Import from schemas（Single Source of Truth）=====

import {
    // Enums
    CourseTerm,
    ChargingModel,
    CourseStatus,
    SalaryCalculationMode,
    LessonType,
    LessonStatus,
    // Constants
    COURSE_TERMS,
    CHARGING_MODELS,
    COURSE_STATUSES,
    LESSON_TYPES,
    LESSON_STATUSES,
    DEFAULT_COURSE_TYPES,
    // Types
    type CourseType,
    type CourseTermType,
    type ChargingModelType,
    type CourseStatusType,
    type LessonTypeType,
    type LessonStatusType,
} from "../schemas/common";

// Re-export for consumers
export {
    CourseTerm,
    ChargingModel,
    CourseStatus,
    SalaryCalculationMode,
    LessonType,
    LessonStatus,
    COURSE_TERMS,
    CHARGING_MODELS,
    COURSE_STATUSES,
    LESSON_TYPES,
    LESSON_STATUSES,
    DEFAULT_COURSE_TYPES,
};
export type {
    CourseType,
    CourseTermType,
    ChargingModelType,
    CourseStatusType,
    LessonTypeType,
    LessonStatusType,
};

export interface SchoolBasicData {
    schoolId?: string;
    schoolName: string;
    schoolNameEn: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    partnershipStartDate: string;
    partnershipEndDate: string | null;
    partnershipStartYear?: string;
    confirmationChannel: string;
    remarks: string;
}

export interface SchoolContactData {
    nameChinese: string;
    nameEnglish: string;
    position: string;
    phone: string;
    mobile: string;
    email: string;
    isPrimary: boolean;
}

export interface CourseItemData {
    id: string;
    courseName: string;
    courseType: CourseType;
    courseTerm: CourseTerm;
    startDate: string | null;
    endDate: string | null;
    requiredTutors: number;
    maxStudents: number | null;
    courseDescription: string | null;
    chargingModel: ChargingModel[];
    studentPerLessonFee: number | null;
    studentHourlyFee: number | null;
    studentFullCourseFee: number | null;
    teamActivityFee: number | null;
    tutorPerLessonFee: number | null;
    tutorHourlyFee: number | null;
}

export interface NewCourseFormData {
    school: SchoolBasicData;
    contact: SchoolContactData;
    academicYear: string;
    courses: CourseItemData[];
}

export interface CourseBasicData {
    schoolId: string;
    courseName: string;
    courseType: CourseType;
    courseTerm: CourseTerm;
    academicYear: string;
    startDate: string | null;
    endDate: string | null;
    requiredTutors: number;
    maxStudents: number | null;
    courseDescription: string | null;
}

export interface CourseChargingData {
    chargingModel: ChargingModel[];
    studentPerLessonFee: number | null;
    studentHourlyFee: number | null;
    studentFullCourseFee: number | null;
    teamActivityFee: number | null;
    tutorPerLessonFee: number | null;
    tutorHourlyFee: number | null;
}

export interface CourseFormData extends CourseBasicData, CourseChargingData { }

export const COURSE_TERM_LABELS: Record<CourseTerm, string> = {
    [CourseTerm.FULL_YEAR]: "全期",
    [CourseTerm.FIRST_TERM]: "上學期",
    [CourseTerm.SECOND_TERM]: "下學期",
    [CourseTerm.SUMMER]: "暑期",
};

export const CHARGING_MODEL_LABELS: Record<ChargingModel, string> = {
    [ChargingModel.STUDENT_PER_LESSON]: "學生每節課堂收費",
    [ChargingModel.TUTOR_PER_LESSON]: "導師每堂節數收費",
    [ChargingModel.STUDENT_HOURLY]: "學生課堂時數收費",
    [ChargingModel.TUTOR_HOURLY]: "導師時薪節數收費",
    [ChargingModel.STUDENT_FULL_COURSE]: "學生全期課程收費",
    [ChargingModel.TEAM_ACTIVITY]: "帶隊活動收費",
};

function generateUUID(): string {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export function generateAcademicYears(): string[] {
    const currentYear = new Date().getFullYear();
    const years: string[] = [];
    for (let i = -1; i <= 2; i++) {
        const year = currentYear + i;
        years.push(`${year}-${year + 1}`);
    }
    return years;
}

export function getDefaultSchoolData(): SchoolBasicData {
    const today = new Date().toISOString().split("T")[0];
    return {
        schoolId: undefined,
        schoolName: "",
        schoolNameEn: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        partnershipStartDate: today,
        partnershipEndDate: null,
        confirmationChannel: "",
        remarks: "",
    };
}

export function getDefaultContactData(): SchoolContactData {
    return {
        nameChinese: "",
        nameEnglish: "",
        position: "",
        phone: "",
        mobile: "",
        email: "",
        isPrimary: true,
    };
}

export function getDefaultCourseItem(): CourseItemData {
    return {
        id: generateUUID(),
        courseName: "",
        courseType: "",
        courseTerm: CourseTerm.FULL_YEAR,
        startDate: null,
        endDate: null,
        requiredTutors: 1,
        maxStudents: null,
        courseDescription: null,
        chargingModel: [],
        studentPerLessonFee: null,
        studentHourlyFee: null,
        studentFullCourseFee: null,
        teamActivityFee: null,
        tutorPerLessonFee: null,
        tutorHourlyFee: null,
    };
}

export function getDefaultNewCourseFormData(): NewCourseFormData {
    return {
        school: getDefaultSchoolData(),
        contact: getDefaultContactData(),
        academicYear: generateAcademicYears()[1],
        courses: [getDefaultCourseItem()],
    };
}

export function calculateAcademicYear(startDate: string, endDate: string | null): string {
    if (!startDate) return "";

    const startYear = new Date(startDate).getFullYear();
    const endYear = endDate ? new Date(endDate).getFullYear() : startYear;

    return endYear !== startYear ? `${startYear}-${endYear}` : `${startYear}`;
}

// ===== Lesson Labels（UI 專用）=====

export const LESSON_TYPE_LABELS: Record<LessonType, string> = {
    [LessonType.REGULAR]: "恆常課堂",
    [LessonType.MAKEUP]: "補堂",
    [LessonType.EXTRA_PRACTICE]: "加操",
};

export const LESSON_STATUS_LABELS: Record<LessonStatus, string> = {
    [LessonStatus.SCHEDULED]: "已排程",
    [LessonStatus.IN_PROGRESS]: "進行中",
    [LessonStatus.COMPLETED]: "已完成",
    [LessonStatus.CANCELLED]: "已取消",
    [LessonStatus.POSTPONED]: "已延期",
};

export const LESSON_STATUS_COLORS: Record<LessonStatus, string> = {
    [LessonStatus.SCHEDULED]:
        "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    [LessonStatus.IN_PROGRESS]:
        "bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400",
    [LessonStatus.COMPLETED]:
        "bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400",
    [LessonStatus.CANCELLED]:
        "bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400",
    [LessonStatus.POSTPONED]:
        "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};

export interface LessonWithDetails {
    id: string;
    lessonDate: Date;
    startTime: string;
    endTime: string;
    weekday: number;
    lessonType: LessonType;
    lessonStatus: LessonStatus;
    studentCount: number | null;
    requiredTutors: number;
    assignedTutors: number;
    course: {
        id: string;
        courseName: string;
        courseType: string;
    };
    school: {
        id: string;
        schoolName: string;
    };
}

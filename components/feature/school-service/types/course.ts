export type CourseType = string;

export const DEFAULT_COURSE_TYPES = [
    "興趣班",
    "表演班",
    "校隊班",
    "暑期班",
    "推廣活動",
] as const;

export enum CourseTerm {
    FULL_YEAR = "FULL_YEAR",
    FIRST_TERM = "FIRST_TERM",
    SECOND_TERM = "SECOND_TERM",
    SUMMER = "SUMMER",
}

export enum ChargingModel {
    STUDENT_PER_LESSON = "STUDENT_PER_LESSON",
    TUTOR_PER_LESSON = "TUTOR_PER_LESSON",
    STUDENT_HOURLY = "STUDENT_HOURLY",
    TUTOR_HOURLY = "TUTOR_HOURLY",
    STUDENT_FULL_COURSE = "STUDENT_FULL_COURSE",
    TEAM_ACTIVITY = "TEAM_ACTIVITY",
}

export enum SalaryCalculationMode {
    PER_LESSON = "PER_LESSON",
    HOURLY = "HOURLY",
    MONTHLY_FIXED = "MONTHLY_FIXED",
}

export enum CourseStatus {
    DRAFT = "DRAFT",
    SCHEDULED = "SCHEDULED",
    ACTIVE = "ACTIVE",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    SUSPENDED = "SUSPENDED",
}

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

export interface CoursePreview extends CourseFormData {
    schoolName?: string;
    estimatedRevenue: number;
    estimatedCost: number;
    estimatedProfit: number;
}

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

export const SALARY_MODE_LABELS: Record<SalaryCalculationMode, string> = {
    [SalaryCalculationMode.PER_LESSON]: "按堂計算",
    [SalaryCalculationMode.HOURLY]: "按小時計算",
    [SalaryCalculationMode.MONTHLY_FIXED]: "固定月薪",
};

function generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
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

export function calculateEstimatedRevenue(
    data: CourseFormData,
    estimatedLessons: number = 12
): number {
    const studentCount = data.maxStudents || 0;
    let totalRevenue = 0;

    data.chargingModel.forEach((model) => {
        switch (model) {
            case ChargingModel.STUDENT_PER_LESSON:
                totalRevenue += studentCount * (data.studentPerLessonFee || 0) * estimatedLessons;
                break;
            case ChargingModel.TUTOR_PER_LESSON:
                totalRevenue += (data.tutorPerLessonFee || 0) * estimatedLessons;
                break;
            case ChargingModel.STUDENT_HOURLY:
                totalRevenue += studentCount * (data.studentHourlyFee || 0) * estimatedLessons * 1.5;
                break;
            case ChargingModel.TUTOR_HOURLY:
                totalRevenue += (data.tutorHourlyFee || 0) * estimatedLessons * 1.5;
                break;
            case ChargingModel.STUDENT_FULL_COURSE:
                totalRevenue += studentCount * (data.studentFullCourseFee || 0);
                break;
            case ChargingModel.TEAM_ACTIVITY:
                totalRevenue += data.teamActivityFee || 0;
                break;
        }
    });

    return totalRevenue;
}

export function calculateEstimatedCost(
    data: CourseFormData,
    estimatedLessons: number = 12
): number {
    const tutorCount = data.requiredTutors || 1;
    return (data.tutorPerLessonFee || 0) * tutorCount * estimatedLessons;
}

export function calculateCourseItemRevenue(
    course: CourseItemData,
    estimatedLessons: number = 12
): number {
    const studentCount = course.maxStudents || 0;
    let totalRevenue = 0;

    course.chargingModel.forEach((model) => {
        switch (model) {
            case ChargingModel.STUDENT_PER_LESSON:
                totalRevenue += studentCount * (course.studentPerLessonFee || 0) * estimatedLessons;
                break;
            case ChargingModel.TUTOR_PER_LESSON:
                totalRevenue += (course.tutorPerLessonFee || 0) * estimatedLessons;
                break;
            case ChargingModel.STUDENT_HOURLY:
                totalRevenue += studentCount * (course.studentHourlyFee || 0) * estimatedLessons * 1.5;
                break;
            case ChargingModel.TUTOR_HOURLY:
                totalRevenue += (course.tutorHourlyFee || 0) * estimatedLessons * 1.5;
                break;
            case ChargingModel.STUDENT_FULL_COURSE:
                totalRevenue += studentCount * (course.studentFullCourseFee || 0);
                break;
            case ChargingModel.TEAM_ACTIVITY:
                totalRevenue += course.teamActivityFee || 0;
                break;
        }
    });

    return totalRevenue;
}

export function calculateCourseItemCost(
    course: CourseItemData,
    estimatedLessons: number = 12
): number {
    const tutorCount = course.requiredTutors || 1;
    return (course.tutorPerLessonFee || 0) * tutorCount * estimatedLessons;
}

export function getDefaultSchoolData(): SchoolBasicData {
    return {
        schoolId: undefined,
        schoolName: "",
        schoolNameEn: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        partnershipStartDate: "",
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

    const start = new Date(startDate);
    const startYear = start.getFullYear();

    if (endDate) {
        const end = new Date(endDate);
        const endYear = end.getFullYear();

        if (endYear !== startYear) {
            return `${startYear}-${endYear}`;
        }
    }

    return `${startYear}`;
}

export function getDefaultCourseFormData(): CourseFormData {
    return {
        schoolId: "",
        courseName: "",
        courseType: "興趣班",
        courseTerm: CourseTerm.FULL_YEAR,
        academicYear: generateAcademicYears()[1],
        startDate: null,
        endDate: null,
        requiredTutors: 1,
        maxStudents: null,
        courseDescription: null,
        chargingModel: [ChargingModel.STUDENT_PER_LESSON],
        studentPerLessonFee: null,
        studentHourlyFee: null,
        studentFullCourseFee: null,
        teamActivityFee: null,
        tutorPerLessonFee: null,
        tutorHourlyFee: null,
    };
}

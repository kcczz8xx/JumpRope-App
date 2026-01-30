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
    return crypto.randomUUID();
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


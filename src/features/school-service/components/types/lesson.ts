export enum LessonType {
    REGULAR = "REGULAR",
    MAKEUP = "MAKEUP",
    EXTRA_PRACTICE = "EXTRA_PRACTICE",
}

export enum LessonStatus {
    SCHEDULED = "SCHEDULED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    POSTPONED = "POSTPONED",
}

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

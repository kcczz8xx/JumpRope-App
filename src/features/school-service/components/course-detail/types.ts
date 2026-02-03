export interface LessonStats {
  total: number;
  completed: number;
  scheduled: number;
  cancelled: number;
}

export interface CourseData {
  id: string;
  courseName: string;
  courseCode?: string | null;
  courseType: string;
  description?: string | null;
  courseTerm: string;
  academicYear: string;
  startDate?: Date | null;
  endDate?: Date | null;
  requiredTutors: number;
  maxStudents?: number | null;
  chargingModels: string[];
  studentPerLessonFee?: number | null;
  studentHourlyFee?: number | null;
  studentFullCourseFee?: number | null;
  teamActivityFee?: number | null;
  tutorPerLessonFee?: number | null;
  tutorHourlyFee?: number | null;
  status: string;
  _count?: {
    lessons: number;
  };
  lessonStats?: LessonStats;
}

export interface CourseCardsProps {
  courses: CourseData[];
  selectedYear: string;
}

export interface QuickAction {
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export const COURSE_TERM_MAP: Record<string, string> = {
  FULL_YEAR: "全期",
  FIRST_TERM: "上學期",
  SECOND_TERM: "下學期",
  SUMMER: "暑期",
};

export const COURSE_STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "草稿", color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" },
  SCHEDULED: { label: "已排程", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  ACTIVE: { label: "進行中", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300" },
  COMPLETED: { label: "已完成", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  CANCELLED: { label: "已取消", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
  SUSPENDED: { label: "已暫停", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
};

export const CHARGING_MODEL_MAP: Record<string, { label: string; desc: string }> = {
  STUDENT_PER_LESSON: { label: "學生每堂", desc: "按學生人數 × 課堂數收費" },
  TUTOR_PER_LESSON: { label: "導師每堂", desc: "按導師課堂數收費" },
  STUDENT_HOURLY: { label: "學生時薪", desc: "按學生人數 × 小時數收費" },
  TUTOR_HOURLY: { label: "導師時薪", desc: "按導師工作時數收費" },
  STUDENT_FULL_COURSE: { label: "學生全期", desc: "學生一次性繳付全期費用" },
  TEAM_ACTIVITY: { label: "帶隊活動", desc: "整個活動收費" },
};

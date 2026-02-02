/**
 * 業務邏輯相關錯誤碼 (BUSINESS)
 */

export const BUSINESS_ERRORS = {
  SCHOOL_HAS_COURSES: {
    code: "BIZ_001",
    status: 409,
    i18n: "errors.business.school_has_courses",
    message: "學校仍有課程，無法刪除",
  },
  COURSE_HAS_STUDENTS: {
    code: "BIZ_002",
    status: 409,
    i18n: "errors.business.course_has_students",
    message: "課程仍有學生，無法刪除",
  },
  ENROLLMENT_CLOSED: {
    code: "BIZ_003",
    status: 400,
    i18n: "errors.business.enrollment_closed",
    message: "報名已截止",
  },
} as const;

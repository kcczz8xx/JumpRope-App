/**
 * 共用常數
 */

// ===== OTP 相關 =====
export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 5;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

// ===== 速率限制 =====
export const RATE_LIMITS = {
  OTP_SEND: { max: 5, window: 3600 }, // 每小時 5 次
  OTP_VERIFY: { max: 10, window: 3600 }, // 每小時 10 次
  LOGIN: { max: 10, window: 900 }, // 每 15 分鐘 10 次
  REGISTER: { max: 3, window: 3600 }, // 每小時 3 次
  PASSWORD_RESET: { max: 3, window: 3600 }, // 每小時 3 次
  API_GENERAL: { max: 100, window: 60 }, // 每分鐘 100 次
} as const;

// ===== 分頁 =====
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ===== 檔案上傳 =====
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// ===== 業務邏輯 =====
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_SCHOOL_NAME_LENGTH = 100;
export const MAX_COURSE_NAME_LENGTH = 100;

// ===== 審計動作名稱 =====
export const AUDIT_ACTIONS = {
  // Auth
  OTP_SEND: "OTP_SEND",
  OTP_VERIFY: "OTP_VERIFY",
  REGISTER: "REGISTER",
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  PASSWORD_CHANGE: "PASSWORD_CHANGE",
  PASSWORD_RESET_REQUEST: "PASSWORD_RESET_REQUEST",
  PASSWORD_RESET_COMPLETE: "PASSWORD_RESET_COMPLETE",

  // School
  SCHOOL_CREATE: "SCHOOL_CREATE",
  SCHOOL_UPDATE: "SCHOOL_UPDATE",
  SCHOOL_DELETE: "SCHOOL_DELETE",

  // Course
  COURSE_CREATE: "COURSE_CREATE",
  COURSE_UPDATE: "COURSE_UPDATE",
  COURSE_DELETE: "COURSE_DELETE",

  // User
  USER_PROFILE_UPDATE: "USER_PROFILE_UPDATE",
  USER_ADDRESS_UPDATE: "USER_ADDRESS_UPDATE",
  USER_BANK_UPDATE: "USER_BANK_UPDATE",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

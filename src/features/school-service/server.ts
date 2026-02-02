/**
 * School Service Feature - Server-only exports
 * 僅供 Server Components 使用
 */

import "server-only";

export {
  getSchools,
  getSchoolById,
  getCourses,
  getCourseById,
} from "./queries";

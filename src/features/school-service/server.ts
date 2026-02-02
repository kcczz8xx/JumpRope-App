/**
 * School Service Feature - Server-only exports
 * 僅供 Server Components 使用
 */

import "server-only";

export {
  getSchoolsAction,
  getSchoolByIdAction,
  getCoursesAction,
  getCourseByIdAction,
} from "./queries";

/**
 * useNewCourseFormValidation - 使用 Zod Schema 進行表單驗證
 *
 * 遵循 Form-Validation-Guide.md 規範：
 * - Single Source of Truth：使用 schemas/new-course.ts 定義的 schema
 * - 多步驟表單使用 safeParse 模式
 */

import { useCallback } from "react";
import { NewCourseFormData } from "../../types";
import {
  newCourseStep1Schema,
  newCourseStep2Schema,
} from "../../../schemas/new-course";

interface UseNewCourseFormValidationResult {
  validateStep1: () => boolean;
  validateStep2: () => boolean;
}

/**
 * 將 Zod 錯誤轉換為表單錯誤格式
 */
function zodErrorsToFormErrors(
  zodErrors: { path: PropertyKey[]; message: string }[],
  prefix = ""
): Record<string, string> {
  const errors: Record<string, string> = {};

  zodErrors.forEach((error) => {
    // 將 path 轉換為錯誤 key
    // e.g., ["school", "schoolName"] -> "schoolName"
    // e.g., ["contact", "nameChinese"] -> "contactNameChinese"
    const path = error.path;

    if (path[0] === "school" && path.length > 1) {
      errors[String(path[1])] = error.message;
    } else if (path[0] === "contact" && path.length > 1) {
      errors[`contact${String(path[1]).charAt(0).toUpperCase()}${String(path[1]).slice(1)}`] = error.message;
    } else if (path.length > 0) {
      errors[`${prefix}${path.join("_")}`] = error.message;
    }
  });

  return errors;
}

/**
 * 將課程陣列的 Zod 錯誤轉換為表單錯誤格式
 */
function zodCourseErrorsToFormErrors(
  zodErrors: { path: PropertyKey[]; message: string }[]
): Record<string, string> {
  const errors: Record<string, string> = {};

  zodErrors.forEach((error) => {
    const path = error.path;

    // e.g., ["courses", 0, "courseName"] -> "course_0_courseName"
    if (path[0] === "courses") {
      if (path.length === 1) {
        errors.courses = error.message;
      } else if (typeof path[1] === "number" && path.length > 2) {
        const index = path[1];
        const field = path.slice(2).join("_");
        errors[`course_${index}_${field}`] = error.message;
      }
    }
  });

  return errors;
}

export function useNewCourseFormValidation(
  formData: NewCourseFormData,
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
): UseNewCourseFormValidationResult {
  const validateStep1 = useCallback((): boolean => {
    const result = newCourseStep1Schema.safeParse({
      school: formData.school,
      contact: formData.contact,
    });

    if (!result.success) {
      const errors = zodErrorsToFormErrors(result.error.issues);
      setErrors(errors);
      return false;
    }

    setErrors({});
    return true;
  }, [formData, setErrors]);

  const validateStep2 = useCallback((): boolean => {
    const result = newCourseStep2Schema.safeParse({
      courses: formData.courses,
    });

    if (!result.success) {
      const errors = zodCourseErrorsToFormErrors(result.error.issues);
      setErrors(errors);
      return false;
    }

    setErrors({});
    return true;
  }, [formData, setErrors]);

  return { validateStep1, validateStep2 };
}

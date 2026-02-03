"use server";

/**
 * School Service Queries - 課程查詢
 *
 * 使用 createAction wrapper 自動處理認證和錯誤
 */

import { prisma } from "@/lib/db";
import { createAction, success } from "@/lib/patterns";
import { failureFromCode } from "@/features/_core/error-codes";

type CourseListParams = {
  schoolId?: string;
  status?: string;
  academicYear?: string;
};

type CourseListItem = {
  id: string;
  courseName: string;
  courseType: string | null;
  courseTerm: string | null;
  academicYear: string | null;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
  requiredTutors: number;
  maxStudents: number | null;
  school: {
    id: string;
    schoolName: string;
  };
  _count: {
    lessons: number;
  };
};

/**
 * 獲取課程列表
 */
export const getCoursesAction = createAction<CourseListParams | undefined, CourseListItem[]>(
  async (params, ctx) => {
    if (!ctx.session?.user) {
      return failureFromCode("PERMISSION", "UNAUTHORIZED");
    }

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (params?.schoolId) {
      where.schoolId = params.schoolId;
    }

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.academicYear) {
      where.academicYear = params.academicYear;
    }

    const courses = await prisma.schoolCourse.findMany({
      where,
      include: {
        school: {
          select: {
            id: true,
            schoolName: true,
          },
        },
        _count: {
          select: {
            lessons: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    return success(courses);
  },
  {
    requireAuth: true,
  }
);

type CourseByIdInput = { id: string };

/**
 * 根據 ID 獲取課程詳情
 */
export const getCourseByIdAction = createAction<CourseByIdInput, CourseListItem>(
  async (input, ctx) => {
    if (!ctx.session?.user) {
      return failureFromCode("PERMISSION", "UNAUTHORIZED");
    }

    if (!input.id) {
      return failureFromCode("VALIDATION", "MISSING_FIELD");
    }

    const course = await prisma.schoolCourse.findUnique({
      where: { id: input.id },
      include: {
        school: {
          select: {
            id: true,
            schoolName: true,
          },
        },
        _count: {
          select: {
            lessons: true,
          },
        },
      },
    });

    if (!course || course.deletedAt) {
      return failureFromCode("RESOURCE", "NOT_FOUND");
    }

    return success(course);
  },
  {
    requireAuth: true,
  }
);

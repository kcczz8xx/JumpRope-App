/**
 * School Service Queries - 課程查詢
 */

import { prisma } from "@/lib/db";
import { requireUser, success, failure, type ActionResult } from "@/lib/actions";

export async function getCourses(params?: {
  schoolId?: string;
  status?: string;
  academicYear?: string;
}): Promise<
  ActionResult<
    Array<{
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
    }>
  >
> {
  const auth = await requireUser();
  if (!auth.ok) return auth;

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
}

export async function getCourseById(id: string) {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  if (!id) {
    return failure("VALIDATION_ERROR", "缺少課程 ID");
  }

  const course = await prisma.schoolCourse.findUnique({
    where: { id },
    include: {
      school: {
        select: {
          id: true,
          schoolName: true,
        },
      },
    },
  });

  if (!course || course.deletedAt) {
    return failure("NOT_FOUND", "課程不存在");
  }

  return success(course);
}

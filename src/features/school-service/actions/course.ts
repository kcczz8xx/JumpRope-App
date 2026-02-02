"use server";

/**
 * School Service Actions - 課程管理
 */

import { prisma } from "@/lib/db";
import type { CourseTerm, ChargingModel } from "@prisma/client";
import { safeAction, success, failure, requireUser } from "@/lib/actions";
import { createCourseSchema } from "../schemas/course";

export const createCourseAction = safeAction(createCourseSchema, async (input) => {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const {
    schoolId,
    courseName,
    courseType,
    courseTerm,
    academicYear,
    startDate,
    endDate,
    requiredTutors,
    maxStudents,
    courseDescription,
    chargingModel,
    studentPerLessonFee,
    totalCourseFee,
    tutorPerLessonFee,
  } = input;

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
  });

  if (!school || school.deletedAt) {
    return failure("NOT_FOUND", "學校不存在");
  }

  const course = await prisma.schoolCourse.create({
    data: {
      schoolId,
      courseName: courseName.trim(),
      courseType: courseType || "REGULAR",
      courseTerm: courseTerm as CourseTerm | undefined,
      academicYear: academicYear || new Date().getFullYear().toString(),
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      requiredTutors: requiredTutors || 1,
      maxStudents: maxStudents || undefined,
      chargingModels: chargingModel ? [chargingModel as ChargingModel] : [],
      studentPerLessonFee: studentPerLessonFee ?? null,
      studentFullCourseFee: totalCourseFee ?? null,
      tutorPerLessonFee: tutorPerLessonFee ?? null,
      description: courseDescription || null,
      status: "ACTIVE",
    },
    include: {
      school: {
        select: {
          id: true,
          schoolName: true,
        },
      },
    },
  });

  return success({ message: "課程建立成功", course });
});

export async function deleteCourseAction(id: string) {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  if (!id) {
    return failure("VALIDATION_ERROR", "缺少課程 ID");
  }

  const existingCourse = await prisma.schoolCourse.findUnique({
    where: { id },
  });

  if (!existingCourse || existingCourse.deletedAt) {
    return failure("NOT_FOUND", "課程不存在");
  }

  await prisma.schoolCourse.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return success({ message: "課程已刪除" });
}

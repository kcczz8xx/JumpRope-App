"use server";

/**
 * School Service Feature - Server Actions
 * 學校服務相關的伺服器操作
 */

import { prisma } from "@/lib/db";
import type { CourseTerm, ChargingModel } from "@prisma/client";
import { safeAction, success, failure, requireUser } from "@/lib/actions";
import {
  createSchoolSchema,
  updateSchoolSchema,
  createCourseSchema,
  batchCreateWithSchoolSchema,
} from "./schema";

// ============================================
// School Actions
// ============================================

export const createSchoolAction = safeAction(createSchoolSchema, async (input) => {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const {
    schoolName,
    schoolNameEn,
    address,
    phone,
    email,
    website,
    partnershipStartDate,
    partnershipEndDate,
    partnershipStartYear,
    confirmationChannel,
    remarks,
  } = input;

  const school = await prisma.school.create({
    data: {
      schoolName: schoolName.trim(),
      schoolNameEn: schoolNameEn || undefined,
      address: address || "",
      phone: phone || null,
      email: email || null,
      website: website || null,
      partnershipStartDate: partnershipStartDate ? new Date(partnershipStartDate) : null,
      partnershipEndDate: partnershipEndDate ? new Date(partnershipEndDate) : null,
      partnershipStartYear: partnershipStartYear || null,
      confirmationChannel: confirmationChannel || null,
      remarks: remarks || null,
      partnershipStatus: "CONFIRMED",
    },
  });

  return success({ message: "學校建立成功", school });
});

export const updateSchoolAction = safeAction(updateSchoolSchema, async (input) => {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const { id, ...updateData } = input;

  const existingSchool = await prisma.school.findUnique({
    where: { id },
  });

  if (!existingSchool || existingSchool.deletedAt) {
    return failure("NOT_FOUND", "學校不存在");
  }

  const data: Record<string, unknown> = {};

  if (updateData.schoolName !== undefined) data.schoolName = updateData.schoolName;
  if (updateData.schoolNameEn !== undefined) data.schoolNameEn = updateData.schoolNameEn || null;
  if (updateData.address !== undefined) data.address = updateData.address || null;
  if (updateData.phone !== undefined) data.phone = updateData.phone || null;
  if (updateData.email !== undefined) data.email = updateData.email || null;
  if (updateData.website !== undefined) data.website = updateData.website || null;
  if (updateData.partnershipStartDate !== undefined) {
    data.partnershipStartDate = updateData.partnershipStartDate
      ? new Date(updateData.partnershipStartDate)
      : null;
  }
  if (updateData.partnershipEndDate !== undefined) {
    data.partnershipEndDate = updateData.partnershipEndDate
      ? new Date(updateData.partnershipEndDate)
      : null;
  }
  if (updateData.partnershipStartYear !== undefined) {
    data.partnershipStartYear = updateData.partnershipStartYear || null;
  }
  if (updateData.confirmationChannel !== undefined) {
    data.confirmationChannel = updateData.confirmationChannel || null;
  }
  if (updateData.remarks !== undefined) data.remarks = updateData.remarks || null;

  const school = await prisma.school.update({
    where: { id },
    data,
  });

  return success({ message: "學校資料更新成功", school });
});

export async function deleteSchoolAction(id: string) {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  if (!id) {
    return failure("VALIDATION_ERROR", "缺少學校 ID");
  }

  const existingSchool = await prisma.school.findUnique({
    where: { id },
  });

  if (!existingSchool || existingSchool.deletedAt) {
    return failure("NOT_FOUND", "學校不存在");
  }

  await prisma.school.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return success({ message: "學校已刪除" });
}

// ============================================
// Course Actions
// ============================================

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

// ============================================
// Batch Creation Action
// ============================================

export const batchCreateWithSchoolAction = safeAction(
  batchCreateWithSchoolSchema,
  async (input) => {
    const auth = await requireUser();
    if (!auth.ok) return auth;

    const { school, contact, academicYear, courses } = input;

    const result = await prisma.$transaction(async (tx) => {
      let schoolId: string | null = null;
      const partnershipStart = school.partnershipStartDate
        ? new Date(school.partnershipStartDate)
        : null;

      if (school.schoolName && partnershipStart) {
        const existingSchool = await tx.school.findFirst({
          where: {
            schoolName: school.schoolName,
            partnershipStartDate: { lte: partnershipStart },
            OR: [
              { partnershipEndDate: null },
              { partnershipEndDate: { gte: partnershipStart } },
            ],
          },
        });

        if (existingSchool) {
          schoolId = existingSchool.id;
        }
      }

      if (!schoolId) {
        const newSchool = await tx.school.create({
          data: {
            schoolName: school.schoolName.trim(),
            schoolNameEn: school.schoolNameEn || undefined,
            address: school.address || "",
            phone: school.phone || undefined,
            email: school.email || undefined,
            website: school.website || undefined,
            partnershipStartDate: school.partnershipStartDate
              ? new Date(school.partnershipStartDate)
              : undefined,
            partnershipEndDate: school.partnershipEndDate
              ? new Date(school.partnershipEndDate)
              : undefined,
            partnershipStartYear: school.partnershipStartYear || undefined,
            confirmationChannel: school.confirmationChannel || undefined,
            remarks: school.remarks || undefined,
            partnershipStatus: "CONFIRMED",
          },
        });
        schoolId = newSchool.id;
      }

      const existingContact = await tx.schoolContact.findFirst({
        where: {
          schoolId: schoolId,
          email: contact.email,
        },
      });

      if (existingContact) {
        await tx.schoolContact.update({
          where: { id: existingContact.id },
          data: {
            nameChinese: contact.nameChinese,
            nameEnglish: contact.nameEnglish || null,
            position: contact.position || null,
            phone: contact.phone || null,
            mobile: contact.mobile || null,
            isPrimary: contact.isPrimary || false,
          },
        });
      } else {
        await tx.schoolContact.create({
          data: {
            schoolId: schoolId,
            nameChinese: contact.nameChinese,
            nameEnglish: contact.nameEnglish || undefined,
            position: contact.position || undefined,
            phone: contact.phone || undefined,
            mobile: contact.mobile || undefined,
            email: contact.email || undefined,
            isPrimary: contact.isPrimary || false,
          },
        });
      }

      const createdCourses = [];
      for (const course of courses) {
        const createdCourse = await tx.schoolCourse.create({
          data: {
            schoolId: schoolId,
            courseName: course.courseName.trim(),
            courseType: course.courseType || "REGULAR",
            courseTerm: course.courseTerm as CourseTerm | undefined,
            academicYear: academicYear || new Date().getFullYear().toString(),
            startDate: course.startDate ? new Date(course.startDate) : undefined,
            endDate: course.endDate ? new Date(course.endDate) : undefined,
            requiredTutors: course.requiredTutors || 1,
            maxStudents: course.maxStudents || undefined,
            description: course.courseDescription || undefined,
            chargingModels: (course.chargingModel as ChargingModel[]) ?? [],
            studentPerLessonFee: course.studentPerLessonFee ?? null,
            studentHourlyFee: course.studentHourlyFee ?? null,
            studentFullCourseFee: course.studentFullCourseFee ?? null,
            teamActivityFee: course.teamActivityFee ?? null,
            tutorPerLessonFee: course.tutorPerLessonFee ?? null,
            tutorHourlyFee: course.tutorHourlyFee ?? null,
            status: "DRAFT",
          },
        });
        createdCourses.push(createdCourse);
      }

      return {
        schoolId,
        coursesCount: createdCourses.length,
      };
    });

    return success({
      message: `成功建立 ${result.coursesCount} 個課程`,
      ...result,
    });
  }
);

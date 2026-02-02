"use server";

/**
 * School Service Actions - 批量建立
 */

import { prisma } from "@/lib/db";
import type { CourseTerm, ChargingModel } from "@prisma/client";
import { safeAction, success, requireUser } from "@/lib/actions";
import { batchCreateWithSchoolSchema } from "../schemas/batch";

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

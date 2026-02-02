import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CourseTerm, ChargingModel } from "@prisma/client";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { school, contact, academicYear, courses } = body;

        if (!school || !contact || !courses || !Array.isArray(courses)) {
            return NextResponse.json(
                { message: "無效的請求數據" },
                { status: 400 }
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. 處理學校
            // 根據學校名稱和合作日期判斷是否使用現有學校
            let schoolId: string | null = null;
            const partnershipStart = school.partnershipStartDate ? new Date(school.partnershipStartDate) : null;

            // 查找同名學校，且合作期間包含當前提交的開始日期
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
                // 創建新學校
                const newSchool = await tx.school.create({
                    data: {
                        schoolName: school.schoolName,
                        schoolNameEn: school.schoolNameEn,
                        address: school.address,
                        phone: school.phone,
                        email: school.email,
                        website: school.website,
                        partnershipStartDate: school.partnershipStartDate ? new Date(school.partnershipStartDate) : null,
                        partnershipEndDate: school.partnershipEndDate ? new Date(school.partnershipEndDate) : null,
                        partnershipStartYear: school.partnershipStartYear,
                        confirmationChannel: school.confirmationChannel,
                        remarks: school.remarks,
                        partnershipStatus: "CONFIRMED",
                    },
                });
                schoolId = newSchool.id;
            }

            // 2. 處理聯絡人
            // 檢查是否已存在相同 email 的聯絡人
            const existingContact = await tx.schoolContact.findFirst({
                where: {
                    schoolId: schoolId,
                    email: contact.email,
                },
            });

            if (existingContact) {
                // 更新現有聯絡人
                await tx.schoolContact.update({
                    where: { id: existingContact.id },
                    data: {
                        nameChinese: contact.nameChinese,
                        nameEnglish: contact.nameEnglish,
                        position: contact.position,
                        phone: contact.phone,
                        mobile: contact.mobile,
                        isPrimary: contact.isPrimary,
                    },
                });
            } else {
                // 創建新聯絡人
                await tx.schoolContact.create({
                    data: {
                        schoolId: schoolId,
                        nameChinese: contact.nameChinese,
                        nameEnglish: contact.nameEnglish,
                        position: contact.position,
                        phone: contact.phone,
                        mobile: contact.mobile,
                        email: contact.email,
                        isPrimary: contact.isPrimary,
                    },
                });
            }

            // 3. 創建課程
            const createdCourses = [];
            for (const course of courses) {
                const createdCourse = await tx.schoolCourse.create({
                    data: {
                        schoolId: schoolId,
                        courseName: course.courseName,
                        courseType: course.courseType,
                        courseTerm: course.courseTerm as CourseTerm,
                        academicYear: academicYear,
                        startDate: course.startDate ? new Date(course.startDate) : null,
                        endDate: course.endDate ? new Date(course.endDate) : null,
                        requiredTutors: course.requiredTutors || 1,
                        maxStudents: course.maxStudents,
                        description: course.courseDescription,
                        chargingModels: course.chargingModel as ChargingModel[],
                        studentPerLessonFee: course.studentPerLessonFee,
                        studentHourlyFee: course.studentHourlyFee,
                        studentFullCourseFee: course.studentFullCourseFee,
                        teamActivityFee: course.teamActivityFee,
                        tutorPerLessonFee: course.tutorPerLessonFee,
                        tutorHourlyFee: course.tutorHourlyFee,
                        status: "DRAFT", // 預設為草稿
                    },
                });
                createdCourses.push(createdCourse);
            }

            return {
                schoolId,
                coursesCount: createdCourses.length,
            };
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Failed to batch create with school:", error);
        return NextResponse.json(
            { message: "建立失敗", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

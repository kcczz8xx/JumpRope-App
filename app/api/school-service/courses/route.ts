import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const schoolId = searchParams.get("schoolId");
        const status = searchParams.get("status");
        const academicYear = searchParams.get("academicYear");

        const where: Record<string, unknown> = {
            deletedAt: null,
        };

        if (schoolId) {
            where.schoolId = schoolId;
        }

        if (status) {
            where.status = status;
        }

        if (academicYear) {
            where.academicYear = academicYear;
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

        return NextResponse.json(courses);
    } catch (error) {
        console.error("Failed to fetch courses:", error);
        return NextResponse.json(
            { message: "Failed to fetch courses" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

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
            fixedPerLessonFee,
            studentPerMonthFee,
            fixedPerMonthFee,
            totalCourseFee,
            tutorSalaryCalculationMode,
            tutorPerLessonFee,
            tutorPerMonthFee,
            tutorTotalCourseFee,
        } = body;

        if (!schoolId) {
            return NextResponse.json(
                { message: "請選擇學校" },
                { status: 400 }
            );
        }

        if (!courseName?.trim()) {
            return NextResponse.json(
                { message: "請輸入課程名稱" },
                { status: 400 }
            );
        }

        const school = await prisma.school.findUnique({
            where: { id: schoolId },
        });

        if (!school) {
            return NextResponse.json(
                { message: "學校不存在" },
                { status: 400 }
            );
        }

        const course = await prisma.schoolCourse.create({
            data: {
                schoolId,
                courseName: courseName.trim(),
                courseType,
                courseTerm,
                academicYear,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                requiredTutors: requiredTutors || 1,
                maxStudents: maxStudents || null,
                chargingModel,
                studentPerLessonFee: studentPerLessonFee
                    ? parseFloat(studentPerLessonFee)
                    : null,
                fixedPerLessonFee: fixedPerLessonFee
                    ? parseFloat(fixedPerLessonFee)
                    : null,
                studentPerMonthFee: studentPerMonthFee
                    ? parseFloat(studentPerMonthFee)
                    : null,
                fixedPerMonthFee: fixedPerMonthFee
                    ? parseFloat(fixedPerMonthFee)
                    : null,
                fixedPerTermFee: totalCourseFee ? parseFloat(totalCourseFee) : null,
                tutorPerLessonFee: tutorPerLessonFee
                    ? parseFloat(tutorPerLessonFee)
                    : null,
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

        return NextResponse.json(course, { status: 201 });
    } catch (error) {
        console.error("Failed to create course:", error);
        return NextResponse.json(
            { message: "建立課程失敗" },
            { status: 500 }
        );
    }
}

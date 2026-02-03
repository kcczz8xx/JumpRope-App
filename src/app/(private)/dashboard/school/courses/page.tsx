import PageBreadcrumb from "@/components/tailadmin/common/PageBreadCrumb";
import { Metadata } from "next";
import { CourseList } from "@/features/school-service";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "課程管理 | 學校服務",
  description: "管理所有學校的課程",
};

export default async function CoursesPage() {
  const rawCourses = await prisma.schoolCourse.findMany({
    where: {
      deletedAt: null,
    },
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

  // 將 Decimal 轉換為 number，避免 Server -> Client 傳遞錯誤
  const courses = rawCourses.map((course) => ({
    ...course,
    studentPerLessonFee: course.studentPerLessonFee
      ? Number(course.studentPerLessonFee)
      : null,
    studentHourlyFee: course.studentHourlyFee
      ? Number(course.studentHourlyFee)
      : null,
    studentFullCourseFee: course.studentFullCourseFee
      ? Number(course.studentFullCourseFee)
      : null,
    teamActivityFee: course.teamActivityFee
      ? Number(course.teamActivityFee)
      : null,
    tutorPerLessonFee: course.tutorPerLessonFee
      ? Number(course.tutorPerLessonFee)
      : null,
    tutorHourlyFee: course.tutorHourlyFee
      ? Number(course.tutorHourlyFee)
      : null,
  }));

  return (
    <>
      <PageBreadcrumb pageTitle="課程管理" />
      <CourseList courses={courses} />
    </>
  );
}

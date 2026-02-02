import PageBreadcrumb from "@/components/tailadmin/common/PageBreadCrumb";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { SchoolInfoCards } from "@/features/school-service/components/pages/detailed/SchoolInfoCards";
import { CourseCards } from "@/features/school-service/components/pages/detailed/CourseCards";

export const metadata: Metadata = {
  title: "學校詳情 | 學校服務",
  description: "查看學校的完整資料",
};

interface SchoolDetailPageProps {
  params: Promise<{ schoolId: string }>;
}

export default async function SchoolDetailPage({
  params,
}: SchoolDetailPageProps) {
  const { schoolId } = await params;

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      courses: {
        where: { deletedAt: null },
        include: {
          _count: {
            select: { lessons: true },
          },
          lessons: {
            where: { deletedAt: null },
            select: {
              id: true,
              lessonStatus: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      invoices: {
        where: { deletedAt: null },
        select: {
          id: true,
          invoiceAmount: true,
          status: true,
        },
      },
    },
  });

  if (!school) {
    notFound();
  }

  const academicYearsSet = new Set(school.courses.map((c) => c.academicYear));
  const academicYears = Array.from(academicYearsSet)
    .sort((a, b) => b.localeCompare(a))
    .map((year) => {
      const yearCourses = school.courses.filter((c) => c.academicYear === year);
      const totalStudents = yearCourses.reduce(
        (sum, c) => sum + (c.maxStudents || 0),
        0
      );
      const totalRevenue = school.invoices
        .filter((inv) => inv.status === "PAID")
        .reduce((sum, inv) => sum + Number(inv.invoiceAmount), 0);

      return {
        year,
        coursesCount: yearCourses.length,
        totalStudents,
        totalRevenue,
      };
    });

  const currentYear = academicYears[0]?.year || "";

  const coursesForCards = school.courses.map((course) => {
    const lessons = course.lessons || [];
    const lessonStats = {
      total: lessons.length,
      completed: lessons.filter((l) => l.lessonStatus === "COMPLETED").length,
      scheduled: lessons.filter((l) => l.lessonStatus === "SCHEDULED").length,
      cancelled: lessons.filter((l) => l.lessonStatus === "CANCELLED").length,
    };

    return {
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
      lessonStats,
    };
  });

  return (
    <div>
      <PageBreadcrumb pageTitle={school.schoolName} />

      <div className="space-y-6">
        <SchoolInfoCards
          school={{
            id: school.id,
            schoolName: school.schoolName,
            schoolNameEn: school.schoolNameEn,
            schoolCode: school.schoolCode,
            address: school.address,
            phone: school.phone,
            fax: school.fax,
            email: school.email,
            website: school.website,
            remarks: school.remarks,
            partnershipStatus: school.partnershipStatus,
            partnershipStartDate: school.partnershipStartDate,
            partnershipEndDate: school.partnershipEndDate,
            partnershipStartYear: school.partnershipStartYear,
            partnershipEndYear: school.partnershipEndYear,
            confirmationChannel: school.confirmationChannel,
          }}
          academicYears={academicYears}
          currentYear={currentYear}
        />

        <CourseCards courses={coursesForCards} selectedYear={currentYear} />
      </div>
    </div>
  );
}

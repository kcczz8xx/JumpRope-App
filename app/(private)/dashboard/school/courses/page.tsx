import PageBreadcrumb from "@/components/tailadmin/common/PageBreadCrumb";
import { Metadata } from "next";
import { CourseList } from "./components/CourseList";
import { courseMockData } from "@/lib/mock-data/school-service";

export const metadata: Metadata = {
  title: "課程管理 | 學校服務",
  description: "管理所有學校的課程",
};

export default async function CoursesPage() {
  const courses = await courseMockData.getCoursesWithSchool() as any;

  return (
    <>
      <PageBreadcrumb pageTitle="課程管理" />
      <CourseList courses={courses} />
    </>
  );
}

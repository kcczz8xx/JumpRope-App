import PageBreadcrumb from "@/components/tailadmin/common/PageBreadCrumb";
import { Metadata } from "next";
import { LessonList } from "@/components/feature/school-service/list/LessonList";
import { getLessonsList } from "@/lib/mock-data/school-service/client";

export const metadata: Metadata = {
  title: "課堂列表 | 學校服務",
  description: "",
};

export default async function LessonListPage() {
  const lessons = getLessonsList();

  return (
    <>
      <PageBreadcrumb pageTitle="課堂列表" />
      <LessonList lessons={lessons} />
    </>
  );
}

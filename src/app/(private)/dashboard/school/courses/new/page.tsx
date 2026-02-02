import PageBreadcrumb from "@/components/tailadmin/common/PageBreadCrumb";
import { NewCourseForm } from "@/features/school-service/components/course";
import { getSchools } from "@/features/school-service";

export default async function NewCoursePage() {
  const result = await getSchools();
  const schools = result.ok ? result.data : [];

  return (
    <>
      <PageBreadcrumb pageTitle="新增課程" />
      <NewCourseForm schools={schools} />
    </>
  );
}

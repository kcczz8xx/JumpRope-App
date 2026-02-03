import PageBreadcrumb from "@/components/tailadmin/common/PageBreadCrumb";
import {
  NewCourseForm,
  getSchoolsAction,
  batchCreateWithSchoolAction,
  getSchoolByIdAction,
} from "@/features/school-service";

export default async function NewCoursePage() {
  const result = await getSchoolsAction();
  const schools = result.success ? result.data : [];

  return (
    <>
      <PageBreadcrumb pageTitle="新增課程" />
      <NewCourseForm
        schools={schools}
        batchCreateAction={batchCreateWithSchoolAction}
        getSchoolByIdAction={getSchoolByIdAction}
      />
    </>
  );
}

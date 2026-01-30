import PageBreadcrumb from "@/components/tailadmin/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "我的課堂 | 學校服務",
  description: "查看和管理我的課堂",
};

export default async function MyLessonsPage() {
  return (
    <>
      <PageBreadcrumb pageTitle="我的課堂" />
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-500 dark:text-gray-400">我的課堂頁面（待開發）</p>
      </div>
    </>
  );
}

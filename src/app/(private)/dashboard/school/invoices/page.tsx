import PageBreadcrumb from "@/components/tailadmin/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "發票管理 | 學校服務",
  description: "管理學校服務發票",
};

export default async function InvoicesPage() {
  return (
    <>
      <PageBreadcrumb pageTitle="發票管理" />
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-500 dark:text-gray-400">發票管理頁面（待開發）</p>
      </div>
    </>
  );
}

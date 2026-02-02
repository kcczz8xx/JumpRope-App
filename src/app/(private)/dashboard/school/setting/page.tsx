import PageBreadcrumb from "@/components/tailadmin/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "設定 | 學校服務",
  description: "管理學校設定",
};

export default async function SettingPage() {
  return (
    <>
      <PageBreadcrumb pageTitle="設定" />
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
        <p className="text-gray-500 dark:text-gray-400">設定頁面（待開發）</p>
      </div>
    </>
  );
}

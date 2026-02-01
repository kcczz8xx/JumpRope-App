import PageBreadcrumb from "@/components/tailadmin/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard",
};

export default async function DashboardPage() {
  return (
    <>
      <PageBreadcrumb pageTitle="Dashboard" />
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
        <p className="text-gray-500 dark:text-gray-400">Dashboard(待開發)</p>
      </div>
    </>
  );
}

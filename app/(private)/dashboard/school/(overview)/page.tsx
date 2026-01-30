import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import { MetricCards } from "./components/MetricCards";
import { ActivityTimeline } from "./components/ActivityTimeline";
import { QuickActions } from "./components/QuickActions";
import { getDashboardMetrics, getRecentActivities } from "./lib/data";

export const metadata: Metadata = {
  title: "管理儀表板 | 學校服務",
  description: "學校服務管理儀表板 - 查看關鍵指標、最近動態和快速操作",
};

// TODO: 從 session 獲取用戶角色和學校 ID
const MOCK_ROLE = "ADMIN";
const MOCK_SCHOOL_ID = undefined;

export default async function OverviewPage() {
  const [metrics, activities] = await Promise.all([
    getDashboardMetrics(MOCK_ROLE, MOCK_SCHOOL_ID),
    getRecentActivities(MOCK_ROLE, MOCK_SCHOOL_ID),
  ]);

  return (
    <div>
      <PageBreadcrumb pageTitle="管理儀表板" />

      <div className="space-y-6">
        {/* 指標卡片 */}
        <MetricCards metrics={metrics} />

        {/* 主內容區 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* 最近動態 - 佔 2/3 */}
          <div className="lg:col-span-2">
            <ActivityTimeline activities={activities} />
          </div>

          {/* 快速操作 - 佔 1/3 */}
          <div>
            <QuickActions role={MOCK_ROLE} />
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { DashboardMetrics } from '../lib/data';

interface MetricCardsProps {
  metrics: DashboardMetrics;
}

export function MetricCards({ metrics }: MetricCardsProps) {
  const metricsData = [
    {
      id: 1,
      title: "本月總收入",
      value: `HK$ ${metrics.revenue.current.toLocaleString()}`,
      href: "/dashboard/school/invoices?status=paid",
    },
    {
      id: 2,
      title: "活躍課程",
      value: `${metrics.activeCourses.count} 個`,
      href: "/dashboard/school/courses?status=active",
    },
    {
      id: 3,
      title: "待發送報價",
      value: `${metrics.pendingQuotations} 份`,
      href: "/dashboard/school/quotations?status=draft",
    },
    {
      id: 4,
      title: "待收款金額",
      value: `HK$ ${metrics.pendingPayment.amount.toLocaleString()}`,
      href: "/dashboard/school/invoices?status=pending",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4">
      {metricsData.map((item) => (
        <Link key={item.id} href={item.href}>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
              {item.value}
            </h4>

            <div className="mt-4 sm:mt-5">
              <p className="text-gray-700 text-theme-sm dark:text-gray-400">
                {item.title}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

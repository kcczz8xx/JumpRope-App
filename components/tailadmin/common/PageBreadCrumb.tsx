"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

interface BreadcrumbProps {
  pageTitle: string;
}

const pathNameMap: Record<string, string> = {
  dashboard: "儀表板",
  school: "學校服務",
  detailed: "學校詳情",
  courses: "課程管理",
  quotations: "報價管理",
  invoices: "發票管理",
  schedule: "排班管理",
  "my-lessons": "我的課堂",
  finance: "財務管理",
  new: "新增",
};

const isUUID = (str: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

const skipSegments = new Set(["detailed"]);

const ChevronIcon = () => (
  <svg
    className="stroke-current"
    width="17"
    height="16"
    viewBox="0 0 17 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
      stroke=""
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle }) => {
  const pathname = usePathname();

  const generateBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: { name: string; path: string }[] = [];

    let currentPath = "";
    for (const segment of segments) {
      currentPath += `/${segment}`;
      if (isUUID(segment) || skipSegments.has(segment)) {
        continue;
      }
      const name = pathNameMap[segment] || segment;
      breadcrumbs.push({ name, path: currentPath });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2
        className="text-xl font-semibold text-gray-800 dark:text-white/90"
        x-text="pageName"
      >
        {pageTitle}
      </h2>
      <nav>
        <ol className="flex items-center gap-1.5">
          <li>
            <Link
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
              href="/"
            >
              主頁
              <ChevronIcon />
            </Link>
          </li>
          {breadcrumbs.slice(0, -1).map((crumb) => (
            <li key={crumb.path}>
              <Link
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
                href={crumb.path}
              >
                {crumb.name}
                <ChevronIcon />
              </Link>
            </li>
          ))}
          <li className="text-sm text-gray-800 dark:text-white/90">
            {pageTitle}
          </li>
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;

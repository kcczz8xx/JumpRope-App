/**
 * Sidebar 選單配置
 * 集中管理所有選單項目與權限設定
 */

import { GridIcon, BoxCubeIcon } from "@/icons/index";
import type { Permission } from "@/lib/rbac/permissions";

export type NavSubItem = {
  name: string;
  path: string;
  pro?: boolean;
  new?: boolean;
  permission?: Permission;
};

export type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  new?: boolean;
  permission?: Permission;
  subItems?: NavSubItem[];
};

export const mainNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "儀表板",
    path: "/dashboard",
  },
  {
    icon: <BoxCubeIcon />,
    name: "學校服務",
    permission: "STAFF_DASHBOARD",
    subItems: [
      { name: "儀表板", path: "/dashboard/school", permission: "STAFF_DASHBOARD" },
      { name: "報價管理", path: "/dashboard/school/quotations", permission: "QUOTATION_READ" },
      { name: "課程管理", path: "/dashboard/school/courses", permission: "COURSE_READ" },
      { name: "排班管理", path: "/dashboard/school/schedule", permission: "LESSON_READ_ANY" },
      { name: "發票管理", path: "/dashboard/school/invoices", permission: "INVOICE_READ" },
      { name: "財務管理", path: "/dashboard/school/finance", permission: "STAFF_DASHBOARD" },
      { name: "我的課堂", path: "/dashboard/school/my-lessons", permission: "LESSON_READ_OWN" },
      { name: "設定", path: "/dashboard/school/setting", permission: "ADMIN_DASHBOARD" },
    ],
  },
];

export const othersNavItems: NavItem[] = [];

export const supportNavItems: NavItem[] = [];

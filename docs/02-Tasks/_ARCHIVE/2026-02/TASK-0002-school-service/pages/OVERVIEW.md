# 📊 管理儀表板 - Overview

> **路徑**: `/dashboard/school/overview`  
> **優先級**: P0  
> **角色**: ADMIN, SCHOOL_ADMIN

---

## 📋 頁面概述

管理儀表板是管理員和學校負責人的主要入口，提供關鍵指標、最近動態和快速操作功能。

---

## 🎨 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 管理儀表板                                    [日期篩選] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  │ 💰 本月收入 │ │ 📚 活躍課程 │ │ 📋 待發報價 │ │ ⏰ 待收款   │
│  │ HK$125,000  │ │    18 個    │ │    3 份     │ │ HK$45,000  │
│  │ ↑15% vs上月│ │ ↑2 vs上月  │ │             │ │ 2張已逾期  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
│                                                             │
│  ┌──────────────────────────────┐ ┌─────────────────────────┐
│  │ 📰 最近動態                  │ │ 🚀 快速操作             │
│  │ ─────────────────────────── │ │ ┌─────────────────────┐ │
│  │ 🟢 2小時前                   │ │ │ ➕ 新增報價         │ │
│  │ 學校A的報價被接受            │ │ └─────────────────────┘ │
│  │                              │ │ ┌─────────────────────┐ │
│  │ 🔵 昨天                      │ │ │ 📚 管理課程         │ │
│  │ 課程「花式跳繩」完成第8堂    │ │ └─────────────────────┘ │
│  │                              │ │ ┌─────────────────────┐ │
│  │ 🟡 3天前                     │ │ │ 💳 生成發票         │ │
│  │ 發票 INV-2024-012 已收款     │ │ └─────────────────────┘ │
│  │                              │ │                         │
│  │ [ 查看更多 ]                 │ │                         │
│  └──────────────────────────────┘ └─────────────────────────┘
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 使用組件

### TailAdmin 組件

| 組件             | 路徑                                   | 用途         |
| ---------------- | -------------------------------------- | ------------ |
| `CardWithIcon`   | `components/cards/card-with-icon/`     | 指標卡片     |
| `PageBreadCrumb` | `components/common/PageBreadCrumb.tsx` | 頁面標題     |
| `Button`         | `components/ui/button/`                | 快速操作按鈕 |
| `Badge`          | `components/ui/badge/Badge.tsx`        | 狀態標籤     |

### 需開發組件

| 組件               | 說明               |
| ------------------ | ------------------ |
| `MetricCard`       | 指標卡片（含趨勢） |
| `ActivityTimeline` | 動態時間線         |
| `QuickActionPanel` | 快速操作面板       |

---

## 📊 指標卡片設計

### 1. 本月總收入

```typescript
interface RevenueMetric {
  currentMonth: number; // 本月收入
  previousMonth: number; // 上月收入
  percentageChange: number; // 變化百分比
}

// 資料來源
const revenue = await prisma.schoolReceipt.aggregate({
  where: {
    paymentConfirmedDate: {
      gte: startOfMonth,
      lte: endOfMonth,
    },
    paymentStatus: "CONFIRMED",
  },
  _sum: { actualReceivedAmount: true },
});
```

### 2. 活躍課程數

```typescript
interface ActiveCoursesMetric {
  count: number;
  changeFromLastMonth: number;
}

// 資料來源
const activeCourses = await prisma.schoolCourse.count({
  where: {
    status: "ACTIVE",
    // SCHOOL_ADMIN: 加入 schoolId 過濾
    ...(isSchoolAdmin && { schoolId: userSchoolId }),
  },
});
```

### 3. 待發送報價

```typescript
// 資料來源
const pendingQuotations = await prisma.schoolQuotation.count({
  where: {
    status: "DRAFT",
    ...(isSchoolAdmin && { schoolId: userSchoolId }),
  },
});
```

### 4. 待收款金額

```typescript
interface PendingPaymentMetric {
  totalAmount: number;
  overdueCount: number;
  overdueAmount: number;
}

// 資料來源
const pendingInvoices = await prisma.schoolInvoice.findMany({
  where: {
    status: { in: ["SENT", "OVERDUE"] },
    ...(isSchoolAdmin && { schoolId: userSchoolId }),
  },
  select: {
    invoiceAmount: true,
    paidAmount: true,
    dueDate: true,
  },
});

const overdueInvoices = pendingInvoices.filter(
  (inv) => inv.dueDate && new Date(inv.dueDate) < new Date()
);
```

---

## 📰 最近動態設計

### 動態類型

```typescript
type ActivityType =
  | "QUOTATION_ACCEPTED" // 報價被接受
  | "QUOTATION_SENT" // 報價已發送
  | "COURSE_CREATED" // 課程已建立
  | "LESSON_COMPLETED" // 課堂已完成
  | "INVOICE_PAID" // 發票已收款
  | "TUTOR_ASSIGNED"; // 導師已分配

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: Date;
  relatedId?: string; // 相關記錄 ID
  relatedType?: string; // quotation | course | invoice
}
```

### 動態聚合查詢

```typescript
// 合併多個資料來源的最近動態
async function getRecentActivities(limit: number = 10) {
  const [quotations, lessons, invoices] = await Promise.all([
    // 最近報價變化
    prisma.schoolQuotation.findMany({
      where: {
        OR: [
          { status: "ACCEPTED", respondedDate: { gte: sevenDaysAgo } },
          { status: "SENT", sentDate: { gte: sevenDaysAgo } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { school: true },
    }),

    // 最近完成課堂
    prisma.schoolLesson.findMany({
      where: {
        lessonStatus: "COMPLETED",
        updatedAt: { gte: sevenDaysAgo },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { course: { include: { school: true } } },
    }),

    // 最近收款
    prisma.schoolReceipt.findMany({
      where: {
        paymentStatus: "CONFIRMED",
        createdAt: { gte: sevenDaysAgo },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { invoice: true, school: true },
    }),
  ]);

  // 合併並排序
  const activities = [
    ...quotations.map((q) => ({
      type: q.status === "ACCEPTED" ? "QUOTATION_ACCEPTED" : "QUOTATION_SENT",
      title: `${q.school.schoolName}的報價${
        q.status === "ACCEPTED" ? "被接受" : "已發送"
      }`,
      timestamp: q.status === "ACCEPTED" ? q.respondedDate : q.sentDate,
      relatedId: q.id,
      relatedType: "quotation",
    })),
    ...lessons.map((l) => ({
      type: "LESSON_COMPLETED",
      title: `課程「${l.course.courseName}」完成第${l.lessonNumber}堂`,
      timestamp: l.updatedAt,
      relatedId: l.courseId,
      relatedType: "course",
    })),
    ...invoices.map((r) => ({
      type: "INVOICE_PAID",
      title: `發票 ${r.invoice.invoiceNumber} 已收款`,
      timestamp: r.createdAt,
      relatedId: r.invoiceId,
      relatedType: "invoice",
    })),
  ];

  return activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}
```

---

## 🚀 快速操作

### ADMIN 角色

```typescript
const adminQuickActions = [
  { label: "新增報價", href: "/dashboard/school/quotations/new", icon: "plus" },
  { label: "管理課程", href: "/dashboard/school/courses", icon: "book" },
  {
    label: "生成發票",
    href: "/dashboard/school/invoices/generate",
    icon: "receipt",
  },
  { label: "導師排班", href: "/dashboard/school/schedule", icon: "calendar" },
];
```

### SCHOOL_ADMIN 角色

```typescript
const schoolAdminQuickActions = [
  { label: "查看報價", href: "/dashboard/school/quotations", icon: "document" },
  { label: "查看課程", href: "/dashboard/school/courses", icon: "book" },
  { label: "查看發票", href: "/dashboard/school/invoices", icon: "receipt" },
];
```

---

## 💻 程式碼範例

### 頁面結構

```tsx
// app/(private)/dashboard/school/overview/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PageBreadCrumb } from "@/components/common/PageBreadCrumb";
import { MetricCards } from "./components/MetricCards";
import { ActivityTimeline } from "./components/ActivityTimeline";
import { QuickActions } from "./components/QuickActions";

export default async function OverviewPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  const { role, schoolId } = session.user;

  // 權限檢查
  if (!["ADMIN", "SCHOOL_ADMIN"].includes(role)) {
    redirect("/dashboard/school/my-lessons");
  }

  // 獲取資料
  const [metrics, activities] = await Promise.all([
    getMetrics(role, schoolId),
    getRecentActivities(role, schoolId),
  ]);

  return (
    <div className="space-y-6">
      <PageBreadCrumb title="管理儀表板" />

      {/* 指標卡片 */}
      <MetricCards metrics={metrics} />

      {/* 主內容區 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 最近動態 */}
        <div className="lg:col-span-2">
          <ActivityTimeline activities={activities} />
        </div>

        {/* 快速操作 */}
        <div>
          <QuickActions role={role} />
        </div>
      </div>
    </div>
  );
}
```

### MetricCards 組件

```tsx
// app/(private)/dashboard/school/overview/components/MetricCards.tsx
"use client";

import { CardWithIcon } from "@/components/cards/card-with-icon";

interface MetricCardsProps {
  metrics: {
    revenue: { current: number; change: number };
    activeCourses: { count: number; change: number };
    pendingQuotations: number;
    pendingPayment: { amount: number; overdueCount: number };
  };
}

export function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="本月總收入"
        value={`HK$ ${metrics.revenue.current.toLocaleString()}`}
        change={metrics.revenue.change}
        icon="dollar"
        href="/dashboard/school/invoices?status=paid"
      />

      <MetricCard
        title="活躍課程"
        value={`${metrics.activeCourses.count} 個`}
        change={metrics.activeCourses.change}
        changeLabel="vs 上月"
        icon="book"
        href="/dashboard/school/courses?status=active"
      />

      <MetricCard
        title="待發送報價"
        value={`${metrics.pendingQuotations} 份`}
        icon="document"
        href="/dashboard/school/quotations?status=draft"
      />

      <MetricCard
        title="待收款金額"
        value={`HK$ ${metrics.pendingPayment.amount.toLocaleString()}`}
        subtitle={
          metrics.pendingPayment.overdueCount > 0
            ? `${metrics.pendingPayment.overdueCount} 張已逾期`
            : undefined
        }
        subtitleColor="red"
        icon="clock"
        href="/dashboard/school/invoices?status=pending"
      />
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  subtitle?: string;
  subtitleColor?: "green" | "red" | "gray";
  icon: string;
  href: string;
}

function MetricCard({
  title,
  value,
  change,
  changeLabel = "% vs 上月",
  subtitle,
  subtitleColor = "gray",
  icon,
  href,
}: MetricCardProps) {
  return (
    <Link href={href}>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {value}
            </p>

            {change !== undefined && (
              <p
                className={`mt-1 text-sm ${
                  change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {change >= 0 ? "↑" : "↓"} {Math.abs(change)}
                {changeLabel}
              </p>
            )}

            {subtitle && (
              <p className={`mt-1 text-sm text-${subtitleColor}-600`}>
                {subtitle}
              </p>
            )}
          </div>

          <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
            <Icon
              name={icon}
              className="h-6 w-6 text-gray-600 dark:text-gray-400"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
```

---

## 📱 響應式設計

| 斷點                    | 指標卡片 | 主內容區 |
| ----------------------- | -------- | -------- |
| mobile (< 640px)        | 1 列     | 1 列     |
| tablet (640px - 1024px) | 2 列     | 1 列     |
| desktop (> 1024px)      | 4 列     | 2:1 比例 |

---

## 🔄 資料更新

- **指標卡片**: 頁面載入時獲取，支援手動刷新
- **最近動態**: 初始載入 10 條，支援「查看更多」載入更多
- **自動刷新**: 可選，每 5 分鐘自動刷新（使用 SWR）

---

## ✅ 驗收標準

- [ ] ADMIN 可查看所有學校的資料
- [ ] SCHOOL_ADMIN 只能查看自己學校的資料
- [ ] 指標卡片顯示正確數據
- [ ] 點擊指標卡片可跳轉到相應頁面
- [ ] 最近動態按時間排序
- [ ] 快速操作按鈕正確跳轉
- [ ] 響應式設計正常運作

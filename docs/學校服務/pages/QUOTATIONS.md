# 📋 報價列表 - Quotations

> **路徑**: `/dashboard/school/quotations`  
> **優先級**: P0  
> **角色**: ADMIN (CRUD), SCHOOL_ADMIN (唯讀)

---

## 📋 頁面概述

報價管理列表頁，顯示所有報價單，支援篩選、搜尋和快速操作。

---

## 🎨 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│ 📋 報價管理                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 狀態: [全部▼] [草稿] [已發送] [已接受] [已拒絕]     │   │
│  │ 搜尋: [________________🔍]     [➕ 新增報價]        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ ┌─────────┬────────────┬──────────┬─────────┬───────┬────────┐
│  │ │ 報價編號│ 學校       │ 查詢日期 │ 金額    │ 狀態  │ 操作   │
│  │ ├─────────┼────────────┼──────────┼─────────┼───────┼────────┤
│  │ │ Q2024-03│ 聖保羅小學 │ 11/10    │ $24,000 │ 🟢已接受│ [轉換] │
│  │ │ Q2024-02│ 培正中學   │ 11/05    │ $18,000 │ 🔵已發送│ [編輯] │
│  │ │ Q2024-01│ 協恩中學   │ 10/28    │ $15,000 │ 🔴已拒絕│ [查看] │
│  │ └─────────┴────────────┴──────────┴─────────┴───────┴────────┘
│  │                                                          │
│  │ 顯示 1-10 / 共 45 筆                    [<] 1 2 3 ... [>]│
│  └──────────────────────────────────────────────────────────┘
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 使用組件

### TailAdmin 組件

| 組件            | 路徑                                  | 用途       |
| --------------- | ------------------------------------- | ---------- |
| `DataTables`    | `components/tables/DataTables/`       | 資料表格   |
| `Pagination`    | `components/ui/pagination/`           | 分頁       |
| `Badge`         | `components/ui/badge/Badge.tsx`       | 狀態標籤   |
| `Dropdown`      | `components/ui/dropdown/`             | 篩選下拉   |
| `Button`        | `components/ui/button/`               | 操作按鈕   |
| `TableDropdown` | `components/common/TableDropdown.tsx` | 行操作選單 |

---

## 📊 資料結構

### 列表資料

```typescript
interface QuotationListItem {
  id: string;
  quotationNumber: string;
  school: {
    id: string;
    schoolName: string;
  };
  inquiryDate: Date | null;
  quotationDate: Date;
  totalAmount: number | null;
  status: QuotationStatus;
  itemCount: number;
  validUntil: Date | null;
}
```

### 查詢參數

```typescript
interface QuotationListParams {
  status?: QuotationStatus | "all";
  search?: string; // 學校名稱或報價編號
  schoolId?: string; // SCHOOL_ADMIN 自動過濾
  page?: number;
  pageSize?: number;
  sortBy?: "quotationDate" | "totalAmount" | "status";
  sortOrder?: "asc" | "desc";
}
```

### API 查詢

```typescript
// API: GET /api/quotations
async function getQuotations(params: QuotationListParams) {
  const { status, search, schoolId, page = 1, pageSize = 10 } = params;

  const where: Prisma.SchoolQuotationWhereInput = {
    deletedAt: null,
    ...(status && status !== "all" && { status }),
    ...(schoolId && { schoolId }),
    ...(search && {
      OR: [
        { quotationNumber: { contains: search, mode: "insensitive" } },
        { school: { schoolName: { contains: search, mode: "insensitive" } } },
      ],
    }),
  };

  const [quotations, total] = await Promise.all([
    prisma.schoolQuotation.findMany({
      where,
      include: {
        school: { select: { id: true, schoolName: true } },
        _count: { select: { items: true } },
      },
      orderBy: { quotationDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.schoolQuotation.count({ where }),
  ]);

  return {
    data: quotations.map((q) => ({
      ...q,
      itemCount: q._count.items,
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
```

---

## 🎯 核心功能

### 1. 狀態篩選

```typescript
const statusOptions = [
  { value: "all", label: "全部" },
  { value: "DRAFT", label: "草稿", color: "gray" },
  { value: "SENT", label: "已發送", color: "blue" },
  { value: "ACCEPTED", label: "已接受", color: "green" },
  { value: "REJECTED", label: "已拒絕", color: "red" },
  { value: "EXPIRED", label: "已過期", color: "orange" },
];
```

### 2. 行操作

```typescript
function getRowActions(quotation: QuotationListItem, role: UserRole) {
  const actions = [];

  // 查看 - 所有人
  actions.push({
    label: "查看",
    href: `/dashboard/school/quotations/${quotation.id}`,
  });

  if (role === "ADMIN") {
    // 編輯 - 只有草稿和已發送可編輯
    if (["DRAFT", "SENT"].includes(quotation.status)) {
      actions.push({
        label: "編輯",
        href: `/dashboard/school/quotations/${quotation.id}?edit=true`,
      });
    }

    // 轉換為課程 - 只有已接受
    if (quotation.status === "ACCEPTED") {
      actions.push({
        label: "轉換為課程",
        href: `/dashboard/school/quotations/${quotation.id}/convert`,
        highlight: true,
      });
    }

    // 發送 - 只有草稿
    if (quotation.status === "DRAFT") {
      actions.push({
        label: "發送報價",
        onClick: () => handleSendQuotation(quotation.id),
      });
    }

    // 刪除 - 只有草稿
    if (quotation.status === "DRAFT") {
      actions.push({
        label: "刪除",
        onClick: () => handleDeleteQuotation(quotation.id),
        danger: true,
      });
    }
  }

  return actions;
}
```

### 3. 狀態徽章

```tsx
function QuotationStatusBadge({ status }: { status: QuotationStatus }) {
  const config: Record<QuotationStatus, { color: string; text: string }> = {
    DRAFT: { color: "gray", text: "草稿" },
    SENT: { color: "blue", text: "已發送" },
    ACCEPTED: { color: "green", text: "已接受" },
    REJECTED: { color: "red", text: "已拒絕" },
    EXPIRED: { color: "orange", text: "已過期" },
  };

  const { color, text } = config[status];

  return (
    <Badge variant="light" color={color}>
      {text}
    </Badge>
  );
}
```

---

## 💻 程式碼範例

### 頁面結構

```tsx
// app/(private)/dashboard/school/quotations/page.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { PageBreadCrumb } from "@/components/common/PageBreadCrumb";
import { QuotationStatusBadge } from "./components/QuotationStatusBadge";
import { TableDropdown } from "@/components/common/TableDropdown";
import { Pagination } from "@/components/ui/pagination";

export default function QuotationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const isAdmin = session?.user?.role === "ADMIN";
  const schoolId =
    session?.user?.role === "SCHOOL_ADMIN" ? session.user.schoolId : undefined;

  // 構建查詢 URL
  const queryString = new URLSearchParams({
    ...(status !== "all" && { status }),
    ...(search && { search }),
    ...(schoolId && { schoolId }),
    page: page.toString(),
  }).toString();

  const { data, isLoading } = useSWR(`/api/quotations?${queryString}`, fetcher);

  const handleRowClick = (quotationId: string) => {
    router.push(`/dashboard/school/quotations/${quotationId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageBreadCrumb title="報價管理" />

        {isAdmin && (
          <Link href="/dashboard/school/quotations/new">
            <Button variant="primary">
              <PlusIcon className="h-4 w-4 mr-2" />
              新增報價
            </Button>
          </Link>
        )}
      </div>

      {/* 篩選器 */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 狀態篩選 */}
        <div className="flex gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setStatus(opt.value);
                setPage(1);
              }}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm transition-colors",
                status === opt.value
                  ? "bg-primary-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 搜尋框 */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜尋學校名稱或報價編號..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
        </div>
      </div>

      {/* 表格 */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                報價編號
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                學校
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                查詢日期
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                金額
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                狀態
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  載入中...
                </td>
              </tr>
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  沒有報價記錄
                </td>
              </tr>
            ) : (
              data?.data.map((quotation: QuotationListItem) => (
                <tr
                  key={quotation.id}
                  onClick={() => handleRowClick(quotation.id)}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm font-medium">
                    {quotation.quotationNumber}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {quotation.school.schoolName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {quotation.inquiryDate
                      ? format(quotation.inquiryDate, "yyyy/MM/dd")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {quotation.totalAmount
                      ? `HK$ ${quotation.totalAmount.toLocaleString()}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <QuotationStatusBadge status={quotation.status} />
                  </td>
                  <td
                    className="px-4 py-3 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TableDropdown
                      items={getRowActions(quotation, session?.user?.role)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 分頁 */}
        {data?.pagination && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              顯示 {(data.pagination.page - 1) * data.pagination.pageSize + 1}-
              {Math.min(
                data.pagination.page * data.pagination.pageSize,
                data.pagination.total
              )}{" "}
              / 共 {data.pagination.total} 筆
            </span>
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 📱 響應式設計

| 斷點    | 表格顯示 | 篩選器   |
| ------- | -------- | -------- |
| mobile  | 卡片列表 | 垂直排列 |
| tablet+ | 表格     | 水平排列 |

### 手機版卡片

```tsx
// 手機版使用卡片列表
function QuotationCardList({
  quotations,
}: {
  quotations: QuotationListItem[];
}) {
  return (
    <div className="space-y-3 sm:hidden">
      {quotations.map((q) => (
        <Link
          key={q.id}
          href={`/dashboard/school/quotations/${q.id}`}
          className="block rounded-xl border border-gray-200 p-4 dark:border-gray-800"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{q.quotationNumber}</span>
            <QuotationStatusBadge status={q.status} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {q.school.schoolName}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-500">
              {q.inquiryDate ? format(q.inquiryDate, "yyyy/MM/dd") : "-"}
            </span>
            <span className="font-medium">
              {q.totalAmount ? `HK$ ${q.totalAmount.toLocaleString()}` : "-"}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
```

---

## ✅ 驗收標準

- [ ] ADMIN 可查看所有報價
- [ ] SCHOOL_ADMIN 只能查看自己學校的報價
- [ ] 狀態篩選正確運作
- [ ] 搜尋功能正確運作
- [ ] 分頁功能正確運作
- [ ] 點擊行跳轉到詳情頁
- [ ] ADMIN 可新增報價
- [ ] 已接受的報價顯示「轉換」按鈕
- [ ] 響應式設計正常運作

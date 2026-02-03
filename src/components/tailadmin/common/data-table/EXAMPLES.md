# DataTable 使用範例

## 範例 1: 簡單產品列表

```tsx
"use client";

import { useState, useEffect } from "react";
import { DataTable, DataTableColumn } from "@/components/common/data-table";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  const columns: DataTableColumn<Product>[] = [
    {
      key: "name",
      label: "產品名稱",
      sortable: true,
    },
    {
      key: "category",
      label: "分類",
      sortable: true,
    },
    {
      key: "price",
      label: "價格",
      sortable: true,
      render: (product) => `$${product.price.toFixed(2)}`,
    },
    {
      key: "stock",
      label: "庫存",
      render: (product) => (
        <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>
          {product.stock > 0 ? `${product.stock} 件` : "缺貨"}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      title="產品列表"
      description="管理所有產品庫存"
      columns={columns}
      data={products}
      searchable
      pagination
      pageSize={10}
    />
  );
}
```

## 範例 2: 帶操作按鈕的用戶列表

```tsx
"use client";

import { useState } from "react";
import { DataTable, DataTableColumn } from "@/components/common/data-table";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "user" | "guest";
  status: "active" | "inactive";
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  const columns: DataTableColumn<User>[] = [
    {
      key: "user",
      label: "用戶",
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <Image
            src={user.avatar}
            width={40}
            height={40}
            alt={user.name}
            className="rounded-full"
          />
          <div>
            <div className="font-medium text-gray-800 dark:text-white">
              {user.name}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "角色",
      sortable: true,
      render: (user) => {
        const roleColors = {
          admin:
            "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
          user: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
          guest:
            "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
        };
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
              roleColors[user.role]
            }`}
          >
            {user.role.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "狀態",
      sortable: true,
      render: (user) => (
        <span
          className={
            user.status === "active" ? "text-green-600" : "text-gray-400"
          }
        >
          {user.status === "active" ? "啟用" : "停用"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "建立日期",
      sortable: true,
    },
    {
      key: "actions",
      label: "操作",
      align: "right",
      render: (user) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => handleEdit(user)}
            className="text-sm text-brand-600 hover:text-brand-700"
          >
            編輯
          </button>
          <button
            onClick={() => handleDelete(user)}
            className="text-sm text-red-600 hover:text-red-700"
          >
            刪除
          </button>
        </div>
      ),
    },
  ];

  const handleEdit = (user: User) => {
    console.log("Edit user:", user);
  };

  const handleDelete = (user: User) => {
    if (confirm(`確定要刪除用戶 ${user.name} 嗎?`)) {
      console.log("Delete user:", user);
    }
  };

  return (
    <DataTable
      title="用戶管理"
      description="管理系統用戶帳號"
      columns={columns}
      data={users}
      actions={[
        {
          label: "匯出 CSV",
          variant: "outline",
          onClick: () => console.log("Export CSV"),
        },
        {
          label: "新增用戶",
          href: "/users/new",
        },
      ]}
      searchable
      searchPlaceholder="搜尋用戶名稱或電郵..."
      selectable
      pagination
      pageSize={15}
    />
  );
}
```

## 範例 3: 帶篩選器的訂單列表

```tsx
"use client";

import { useState } from "react";
import {
  DataTable,
  DataTableColumn,
  DataTableFilter,
} from "@/components/common/data-table";

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  paymentMethod: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const columns: DataTableColumn<Order>[] = [
    {
      key: "orderNumber",
      label: "訂單編號",
      sortable: true,
      render: (order) => (
        <span className="font-mono text-sm">{order.orderNumber}</span>
      ),
    },
    {
      key: "customer",
      label: "客戶",
      sortable: true,
    },
    {
      key: "amount",
      label: "金額",
      sortable: true,
      align: "right",
      render: (order) => (
        <span className="font-semibold">${order.amount.toFixed(2)}</span>
      ),
    },
    {
      key: "paymentMethod",
      label: "付款方式",
    },
    {
      key: "status",
      label: "狀態",
      sortable: true,
      render: (order) => {
        const statusConfig = {
          pending: {
            label: "待處理",
            color:
              "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
          },
          processing: {
            label: "處理中",
            color:
              "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
          },
          completed: {
            label: "已完成",
            color:
              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
          },
          cancelled: {
            label: "已取消",
            color:
              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
          },
        };
        const config = statusConfig[order.status];
        return (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "建立時間",
      sortable: true,
    },
  ];

  const filters: DataTableFilter[] = [
    {
      key: "status",
      label: "訂單狀態",
      type: "select",
      options: [
        { label: "待處理", value: "pending" },
        { label: "處理中", value: "processing" },
        { label: "已完成", value: "completed" },
        { label: "已取消", value: "cancelled" },
      ],
    },
    {
      key: "paymentMethod",
      label: "付款方式",
      type: "select",
      options: [
        { label: "信用卡", value: "credit_card" },
        { label: "PayPal", value: "paypal" },
        { label: "銀行轉帳", value: "bank_transfer" },
      ],
    },
  ];

  return (
    <DataTable
      title="訂單管理"
      description="查看和管理所有訂單"
      columns={columns}
      data={orders}
      actions={[
        {
          label: "匯出報表",
          variant: "outline",
          onClick: () => console.log("Export report"),
        },
      ]}
      filters={filters}
      searchable
      searchPlaceholder="搜尋訂單編號或客戶..."
      selectable
      onSelectionChange={(ids) => console.log("Selected orders:", ids)}
      pagination
      pageSize={20}
      emptyMessage="暫無訂單"
      emptyAction={{
        label: "查看所有產品",
        href: "/products",
      }}
    />
  );
}
```

## 範例 4: 課程管理(實際應用)

使用 Server Component + Server Actions 模式：

```tsx
// page.tsx (Server Component)
import { getCoursesAction } from "@/features/school-service";
import { CourseList } from "./CourseList";

export default async function CoursesPage() {
  const result = await getCoursesAction();
  const courses = result.success ? result.data : [];

  return <CourseList courses={courses} />;
}
```

```tsx
// CourseList.tsx (Client Component)
"use client";

import Link from "next/link";
import { DataTable, DataTableColumn } from "@/components/common/data-table";

interface Course {
  id: string;
  courseName: string;
  courseType: string;
  courseTerm: string;
  academicYear: string;
  chargingModel: string;
  status: string;
  school: {
    schoolName: string;
  };
  _count: {
    lessons: number;
  };
}

interface CourseListProps {
  courses: Course[];
}

export function CourseList({ courses }: CourseListProps) {
  const columns: DataTableColumn<Course>[] = [
    {
      key: "courseName",
      label: "課程",
      sortable: true,
      render: (course) => (
        <div>
          <div className="font-medium text-gray-800 dark:text-white">
            {course.courseName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {course.academicYear}
          </div>
        </div>
      ),
    },
    {
      key: "school",
      label: "學校",
      sortable: true,
      render: (course) => course.school.schoolName,
    },
    {
      key: "courseType",
      label: "類型/學期",
      render: (course) => (
        <div>
          <div className="text-sm">{course.courseType}</div>
          <div className="text-xs text-gray-500">{course.courseTerm}</div>
        </div>
      ),
    },
    {
      key: "lessons",
      label: "課堂數",
      render: (course) => `${course._count.lessons} 堂`,
    },
    {
      key: "status",
      label: "狀態",
      sortable: true,
      render: (course) => (
        <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700">
          {course.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "操作",
      align: "right",
      render: (course) => (
        <Link
          href={`/dashboard/school/courses/${course.id}`}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          查看詳情
        </Link>
      ),
    },
  ];

  if (isLoading) {
    return <div>載入中...</div>;
  }

  return (
    <DataTable
      title="📚 課程列表"
      description="管理所有學校的課程"
      columns={columns}
      data={courses}
      actions={[
        {
          label: "📦 批次新增",
          variant: "outline",
          href: "/dashboard/school/courses/batch",
        },
        {
          label: "📋 模板管理",
          variant: "outline",
          href: "/dashboard/school/courses/templates",
        },
        {
          label: "➕ 新增課程",
          href: "/dashboard/school/courses/new",
        },
      ]}
      searchable
      searchPlaceholder="搜尋課程或學校..."
      selectable
      pagination
      pageSize={10}
      emptyMessage="暫無課程"
      emptyAction={{
        label: "➕ 新增第一個課程",
        href: "/dashboard/school/courses/new",
      }}
    />
  );
}
```

## 範例 5: 帶圖片的產品列表

```tsx
const columns: DataTableColumn<Product>[] = [
  {
    key: "product",
    label: "產品",
    sortable: true,
    render: (product) => (
      <div className="flex items-center gap-3">
        <div className="h-12 w-12">
          <Image
            width={48}
            height={48}
            src={product.image}
            className="h-12 w-12 rounded-md object-cover"
            alt={product.name}
          />
        </div>
        <span className="text-sm font-medium">{product.name}</span>
      </div>
    ),
  },
  {
    key: "category",
    label: "分類",
    sortable: true,
  },
  {
    key: "price",
    label: "價格",
    sortable: true,
    align: "right",
    render: (product) => `$${product.price}`,
  },
  {
    key: "stock",
    label: "庫存",
    render: (product) => (
      <span
        className={`text-xs rounded-full px-2 py-0.5 font-medium ${
          product.stock === "In Stock"
            ? "bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-500"
            : "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-500"
        }`}
      >
        {product.stock}
      </span>
    ),
  },
];
```

## 範例 6: 多選批次操作

```tsx
export default function BatchOperationPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      alert("請先選擇項目");
      return;
    }
    if (confirm(`確定要刪除 ${selectedIds.length} 個項目嗎?`)) {
      console.log("Delete:", selectedIds);
    }
  };

  return (
    <>
      {selectedIds.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-blue-50 p-4">
          <span>已選擇 {selectedIds.length} 項</span>
          <button
            onClick={handleBatchDelete}
            className="rounded-lg bg-red-600 px-4 py-2 text-white"
          >
            批次刪除
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data}
        selectable
        onSelectionChange={setSelectedIds}
        pagination
      />
    </>
  );
}
```

## 提示

1. **自定義 ID** - 如果資料沒有 `id` 欄位,使用 `getRowId`:

   ```tsx
   <DataTable
     getRowId={(row) => row.uuid}
     // ...
   />
   ```

2. **條件渲染** - 在 `render` 中可以使用任何 React 元素:

   ```tsx
   render: (row) => (row.active ? <CheckIcon /> : <XIcon />);
   ```

3. **連結導航** - 使用 Next.js Link:

   ```tsx
   render: (row) => <Link href={`/items/${row.id}`}>查看</Link>;
   ```

4. **空狀態** - 自定義空資料訊息和操作:
   ```tsx
   emptyMessage="還沒有任何資料"
   emptyAction={{
     label: "立即新增",
     href: "/create"
   }}
   ```

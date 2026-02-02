# DataTable 通用組件

參考 `ProductListTable.tsx` 設計的通用表格組件,支援排序、分頁、搜尋、篩選、多選等功能。

## 特性

- ✅ **參數驅動** - 透過配置快速生成表格
- ✅ **排序功能** - 支援欄位排序(升序/降序)
- ✅ **分頁控制** - 內建分頁邏輯
- ✅ **搜尋篩選** - 全局搜尋 + 自定義篩選器
- ✅ **多選支持** - Checkbox 選擇功能
- ✅ **響應式設計** - 支援深色模式
- ✅ **自定義渲染** - 靈活的欄位渲染

## 安裝

組件位於 `components/common/data-table/`

```tsx
import { DataTable, DataTableColumn } from "@/components/common/data-table";
```

## 基本使用

```tsx
"use client";

import { DataTable, DataTableColumn } from "@/components/common/data-table";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const columns: DataTableColumn<Product>[] = [
    {
      key: "name",
      label: "產品名稱",
      sortable: true,
    },
    {
      key: "price",
      label: "價格",
      sortable: true,
      render: (product) => `$${product.price}`,
    },
    {
      key: "stock",
      label: "庫存",
      render: (product) => (
        <span
          className={
            product.stock === "In Stock" ? "text-green-600" : "text-red-600"
          }
        >
          {product.stock}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      title="產品列表"
      description="管理所有產品"
      columns={columns}
      data={products}
      searchable
      pagination
    />
  );
}
```

## API 參考

### DataTable Props

| 屬性                | 類型                      | 預設值                | 說明               |
| ------------------- | ------------------------- | --------------------- | ------------------ |
| `title`             | `string`                  | -                     | 表格標題           |
| `description`       | `string`                  | -                     | 表格描述           |
| `columns`           | `DataTableColumn[]`       | **必填**              | 欄位定義           |
| `data`              | `T[]`                     | **必填**              | 資料陣列           |
| `actions`           | `DataTableAction[]`       | -                     | 操作按鈕           |
| `filters`           | `DataTableFilter[]`       | -                     | 篩選器配置         |
| `searchable`        | `boolean`                 | `false`               | 啟用搜尋           |
| `searchPlaceholder` | `string`                  | `"Search..."`         | 搜尋提示文字       |
| `selectable`        | `boolean`                 | `false`               | 啟用多選           |
| `onSelectionChange` | `(ids: string[]) => void` | -                     | 選擇變更回調       |
| `getRowId`          | `(row: T) => string`      | `row => row.id`       | 取得行 ID          |
| `pagination`        | `boolean`                 | `true`                | 啟用分頁           |
| `pageSize`          | `number`                  | `10`                  | 每頁筆數           |
| `emptyMessage`      | `string`                  | `"No data available"` | 空資料訊息         |
| `emptyAction`       | `object`                  | -                     | 空資料時的操作按鈕 |

### DataTableColumn

```tsx
interface DataTableColumn<T> {
  key: string; // 欄位鍵值
  label: string; // 欄位標籤
  sortable?: boolean; // 是否可排序
  render?: (row: T) => ReactNode; // 自定義渲染
  width?: string; // 欄位寬度
  align?: "left" | "center" | "right"; // 對齊方式
}
```

### DataTableAction

```tsx
interface DataTableAction {
  label: string; // 按鈕文字
  variant?: "primary" | "outline"; // 按鈕樣式
  icon?: ReactNode; // 圖示
  onClick?: () => void; // 點擊事件
  href?: string; // 連結(優先於 onClick)
}
```

### DataTableFilter

```tsx
interface DataTableFilter {
  key: string; // 篩選鍵值
  label: string; // 篩選標籤
  type: "text" | "select"; // 篩選類型
  options?: { label: string; value: string }[]; // 選項(select 用)
  placeholder?: string; // 提示文字
}
```

## 進階範例

### 完整功能範例

```tsx
<DataTable
  title="📚 課程列表"
  description="管理所有學校的課程"
  columns={[
    {
      key: "courseName",
      label: "課程",
      sortable: true,
      render: (course) => (
        <div>
          <div className="font-medium">{course.courseName}</div>
          <div className="text-xs text-gray-500">{course.academicYear}</div>
        </div>
      ),
    },
    {
      key: "status",
      label: "狀態",
      sortable: true,
      render: (course) => (
        <span className={`badge ${statusColors[course.status]}`}>
          {statusLabels[course.status]}
        </span>
      ),
    },
  ]}
  data={courses}
  actions={[
    {
      label: "匯出",
      variant: "outline",
      onClick: handleExport,
    },
    {
      label: "新增課程",
      href: "/courses/new",
    },
  ]}
  filters={[
    {
      key: "academicYear",
      label: "學年",
      type: "select",
      options: [
        { label: "2024-2025", value: "2024-2025" },
        { label: "2025-2026", value: "2025-2026" },
      ],
    },
    {
      key: "status",
      label: "狀態",
      type: "select",
      options: statusOptions,
    },
  ]}
  searchable
  searchPlaceholder="搜尋課程或學校..."
  selectable
  onSelectionChange={(ids) => console.log("Selected:", ids)}
  pagination
  pageSize={15}
  emptyMessage="暫無課程"
  emptyAction={{
    label: "新增第一個課程",
    href: "/courses/new",
  }}
/>
```

### 自定義欄位渲染

```tsx
const columns: DataTableColumn<User>[] = [
  {
    key: "avatar",
    label: "用戶",
    render: (user) => (
      <div className="flex items-center gap-3">
        <Image
          src={user.avatar}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      </div>
    ),
  },
  {
    key: "role",
    label: "角色",
    render: (user) => (
      <span className={`badge ${roleColors[user.role]}`}>
        {roleLabels[user.role]}
      </span>
    ),
  },
  {
    key: "actions",
    label: "操作",
    align: "right",
    render: (user) => (
      <div className="flex gap-2 justify-end">
        <button onClick={() => handleEdit(user)}>編輯</button>
        <button onClick={() => handleDelete(user)}>刪除</button>
      </div>
    ),
  },
];
```

### 多選功能

```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);

<DataTable
  columns={columns}
  data={data}
  selectable
  onSelectionChange={setSelectedIds}
  getRowId={(row) => row.id}
/>;

{
  selectedIds.length > 0 && <div>已選擇 {selectedIds.length} 項</div>;
}
```

## 組件結構

```
components/common/data-table/
├── DataTable.tsx           # 主組件
├── DataTableHeader.tsx     # 標題區(title + actions)
├── DataTableToolbar.tsx    # 工具列(search + filters)
├── DataTablePagination.tsx # 分頁控制
├── types.ts                # TypeScript 定義
├── index.ts                # 匯出
└── README.md               # 文檔
```

## 樣式說明

組件使用 Tailwind CSS,支援深色模式。主要樣式類別:

- `border-gray-200 dark:border-gray-800` - 邊框
- `bg-white dark:bg-gray-800` - 背景
- `text-gray-800 dark:text-white` - 文字
- `hover:bg-gray-50 dark:hover:bg-gray-900` - Hover 效果

## 注意事項

1. **Client Component** - 組件使用 `"use client"`,適用於 Next.js App Router
2. **資料格式** - 資料需包含唯一 `id` 欄位(或透過 `getRowId` 指定)
3. **排序邏輯** - 內建基本排序,複雜排序需自行處理資料
4. **篩選邏輯** - 篩選在客戶端執行,大量資料建議後端篩選

## 遷移指南

從舊的自定義表格遷移到 DataTable:

### 之前

```tsx
<div className="table-container">
  <div className="header">
    <h1>產品列表</h1>
    <button onClick={handleAdd}>新增</button>
  </div>
  <input type="text" onChange={handleSearch} />
  <table>
    <thead>...</thead>
    <tbody>
      {products.map((product) => (
        <tr key={product.id}>...</tr>
      ))}
    </tbody>
  </table>
  <Pagination />
</div>
```

### 之後

```tsx
<DataTable
  title="產品列表"
  columns={columns}
  data={products}
  actions={[{ label: "新增", onClick: handleAdd }]}
  searchable
  pagination
/>
```

## 實際應用

參考以下頁面的實作:

- `app/(private)/dashboard/school/courses/page.tsx` - 課程管理
- `components/ecommerce/ProductListTable.tsx` - 原始設計參考

## 授權

內部專案使用

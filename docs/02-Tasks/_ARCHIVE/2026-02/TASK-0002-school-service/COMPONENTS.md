# 🧩 TailAdmin 組件對應表

> 本文檔列出學校服務系統所需的組件，以及對應的 TailAdmin 現有組件

---

## 📦 現有組件對應

### UI 基礎組件

| 需求      | TailAdmin 組件 | 路徑                            | 備註                |
| --------- | -------------- | ------------------------------- | ------------------- |
| 彈窗      | `Modal`        | `components/ui/modal/index.tsx` | 支援 `isFullscreen` |
| 徽章/標籤 | `Badge`        | `components/ui/badge/Badge.tsx` | 狀態顏色編碼        |
| 按鈕      | `Button`       | `components/ui/button/`         | -                   |
| 分頁      | `Pagination`   | `components/ui/pagination/`     | 列表頁必備          |
| 下拉選單  | `Dropdown`     | `components/ui/dropdown/`       | -                   |
| 麵包屑    | `Breadcrumb`   | `components/ui/breadcrumb/`     | -                   |
| 標籤頁    | `Tabs`         | `components/ui/tabs/`           | -                   |
| 工具提示  | `Tooltip`      | `components/ui/tooltip/`        | -                   |
| 通知      | `Notification` | `components/ui/notification/`   | Toast 提示          |
| 頭像      | `Avatar`       | `components/ui/avatar/`         | 導師頭像            |

### 表單組件

| 需求     | TailAdmin 組件 | 路徑                              | 備註          |
| -------- | -------------- | --------------------------------- | ------------- |
| 輸入框   | `Input`        | `components/form/input/`          | 包含多種樣式  |
| 下拉選擇 | `Select`       | `components/form/Select.tsx`      | 單選          |
| 多選下拉 | `MultiSelect`  | `components/form/MultiSelect.tsx` | 多選學校/導師 |
| 日期選擇 | `DatePicker`   | `components/form/date-picker.tsx` | 課堂日期      |
| 開關     | `Switch`       | `components/form/switch/`         | 狀態切換      |
| 表單標籤 | `Label`        | `components/form/Label.tsx`       | -             |
| 表單容器 | `Form`         | `components/form/Form.tsx`        | -             |

### 表格組件

| 需求     | TailAdmin 組件  | 路徑                                  | 備註       |
| -------- | --------------- | ------------------------------------- | ---------- |
| 基礎表格 | `BasicTables`   | `components/tables/BasicTables/`      | 簡單列表   |
| 資料表格 | `DataTables`    | `components/tables/DataTables/`       | 排序/篩選  |
| 表格下拉 | `TableDropdown` | `components/common/TableDropdown.tsx` | 行操作選單 |

### 卡片組件

| 需求       | TailAdmin 組件   | 路徑                                | 備註       |
| ---------- | ---------------- | ----------------------------------- | ---------- |
| 帶圖標卡片 | `CardWithIcon`   | `components/cards/card-with-icon/`  | 儀表板指標 |
| 帶圖片卡片 | `CardWithImage`  | `components/cards/card-with-image/` | -          |
| 橫向卡片   | `HorizontalCard` | `components/cards/horizontal-card/` | 課程卡片   |

### 日曆組件

| 需求 | TailAdmin 組件 | 路徑                               | 備註     |
| ---- | -------------- | ---------------------------------- | -------- |
| 日曆 | `Calendar`     | `components/calendar/Calendar.tsx` | 排班視圖 |

### 發票組件

| 需求         | TailAdmin 組件       | 路徑                                        | 備註       |
| ------------ | -------------------- | ------------------------------------------- | ---------- |
| 發票列表     | `InvoiceList`        | `components/invoice/InvoiceList.tsx`        | 可直接參考 |
| 發票表格     | `InvoiceTable`       | `components/invoice/InvoiceTable.tsx`       | -          |
| 發票指標     | `InvoiceMetrics`     | `components/invoice/InvoiceMetrics.tsx`     | 財務統計   |
| 創建發票表格 | `CreateInvoiceTable` | `components/invoice/CreateInvoiceTable.tsx` | 參考結構   |

### 通用組件

| 需求       | TailAdmin 組件   | 路徑                                   | 備註     |
| ---------- | ---------------- | -------------------------------------- | -------- |
| 頁面麵包屑 | `PageBreadCrumb` | `components/common/PageBreadCrumb.tsx` | -        |
| 組件卡片   | `ComponentCard`  | `components/common/ComponentCard.tsx`  | 包裝容器 |
| 圖表標籤   | `ChartTab`       | `components/common/ChartTab.tsx`       | 圖表篩選 |

---

## 🆕 需開發的業務組件

### 學校相關

```typescript
// components/school/SchoolSelector.tsx
interface SchoolSelectorProps {
  value?: string;
  onChange: (schoolId: string) => void;
  allowCreate?: boolean; // 是否允許新增學校
  placeholder?: string;
}
```

```typescript
// components/school/SchoolCard.tsx
interface SchoolCardProps {
  school: School;
  showStats?: boolean; // 顯示課程/學生統計
  onClick?: () => void;
}
```

### 報價相關

```typescript
// components/quotation/QuotationStatusBadge.tsx
interface QuotationStatusBadgeProps {
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";
}

// 顏色對應
const statusColors = {
  DRAFT: "gray",
  SENT: "blue",
  ACCEPTED: "green",
  REJECTED: "red",
  EXPIRED: "orange",
};
```

```typescript
// components/quotation/QuotationItemForm.tsx
interface QuotationItemFormProps {
  item?: QuotationItem;
  onSave: (item: QuotationItem) => void;
  onDelete?: () => void;
}
```

### 課程相關

```typescript
// components/course/CourseCard.tsx
interface CourseCardProps {
  course: SchoolCourse;
  showProgress?: boolean; // 顯示進度條
  showTutors?: boolean; // 顯示導師列表
  onClick?: () => void;
}
```

```typescript
// components/course/CourseStatusBadge.tsx
interface CourseStatusBadgeProps {
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
}
```

### 課堂相關

```typescript
// components/lesson/LessonCard.tsx
interface LessonCardProps {
  lesson: SchoolLesson;
  tutorView?: boolean; // 導師視圖（顯示簽到按鈕）
  onClick?: () => void;
}
```

```typescript
// components/lesson/LessonStatusBadge.tsx
interface LessonStatusBadgeProps {
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "MAKEUP";
}
```

```typescript
// components/lesson/BatchLessonGenerator.tsx
interface BatchLessonGeneratorProps {
  courseId: string;
  onGenerate: (lessons: GeneratedLesson[]) => void;
}

// 批次生成規則
interface GenerationRule {
  weekdays: number[]; // 1-7 (週一至週日)
  startTime: string; // "14:00"
  endTime: string; // "15:30"
  startDate: Date;
  endDate: Date;
  excludeDates?: Date[]; // 排除日期（假期）
}
```

### 導師相關

```typescript
// components/tutor/TutorSelector.tsx
interface TutorSelectorProps {
  value?: string[];
  onChange: (tutorIds: string[]) => void;
  multiple?: boolean;
  showAvailability?: boolean; // 顯示時間衝突
  date?: Date; // 檢查特定日期可用性
}
```

```typescript
// components/tutor/TutorLessonCard.tsx
interface TutorLessonCardProps {
  lesson: SchoolTutorLesson;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
  onComplete?: () => void;
}
```

```typescript
// components/tutor/AttendanceButton.tsx
interface AttendanceButtonProps {
  status: "SCHEDULED" | "CHECKED_IN" | "COMPLETED";
  onCheckIn: () => void;
  onCheckOut: () => void;
  disabled?: boolean;
}
```

### 發票相關

```typescript
// components/invoice/InvoiceStatusBadge.tsx
interface InvoiceStatusBadgeProps {
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
  dueDate?: Date; // 計算是否逾期
}
```

```typescript
// components/invoice/LessonSelector.tsx
interface LessonSelectorProps {
  courseId: string;
  selectedLessons: string[];
  onChange: (lessonIds: string[]) => void;
  filterMode: "date_range" | "count" | "manual";
}
```

```typescript
// components/invoice/PaymentForm.tsx
interface PaymentFormProps {
  invoiceId: string;
  invoiceAmount: number;
  onSubmit: (payment: PaymentData) => void;
}

interface PaymentData {
  paymentDate: Date;
  amount: number;
  method: "FPS" | "CHEQUE" | "BANK_TRANSFER" | "CASH";
  transactionNumber?: string;
  notes?: string;
}
```

### 排班相關

```typescript
// components/schedule/WeekView.tsx
interface WeekViewProps {
  weekStart: Date;
  tutors: TutorWithLessons[];
  unassignedLessons: SchoolLesson[];
  onAssign: (lessonId: string, tutorId: string) => void;
}
```

```typescript
// components/schedule/LessonDragItem.tsx
interface LessonDragItemProps {
  lesson: SchoolLesson;
  onDragStart: () => void;
  onDragEnd: () => void;
}
```

### 通用業務組件

```typescript
// components/school/DateRangePicker.tsx
interface DateRangePickerProps {
  value: { start: Date; end: Date };
  onChange: (range: { start: Date; end: Date }) => void;
  presets?: ("today" | "this_week" | "this_month" | "custom")[];
}
```

```typescript
// components/school/MoneyDisplay.tsx
interface MoneyDisplayProps {
  amount: number;
  currency?: "HKD";
  size?: "sm" | "md" | "lg";
  showSign?: boolean; // +/-
}
```

```typescript
// components/school/ProgressBar.tsx
interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
}
```

---

## 🎨 狀態顏色規範

### 報價狀態

| 狀態   | 英文     | 顏色 | Tailwind Class                  |
| ------ | -------- | ---- | ------------------------------- |
| 草稿   | DRAFT    | 灰色 | `bg-gray-100 text-gray-600`     |
| 已發送 | SENT     | 藍色 | `bg-blue-100 text-blue-600`     |
| 已接受 | ACCEPTED | 綠色 | `bg-green-100 text-green-600`   |
| 已拒絕 | REJECTED | 紅色 | `bg-red-100 text-red-600`       |
| 已過期 | EXPIRED  | 橙色 | `bg-orange-100 text-orange-600` |

### 課堂狀態

| 狀態   | 英文      | 顏色 | 說明     |
| ------ | --------- | ---- | -------- |
| 已排程 | SCHEDULED | 藍色 | 待執行   |
| 已完成 | COMPLETED | 綠色 | 正常完成 |
| 已取消 | CANCELLED | 灰色 | 被取消   |
| 補堂   | MAKEUP    | 紫色 | 補回課堂 |

### 發票狀態

| 狀態   | 英文      | 顏色 | 說明       |
| ------ | --------- | ---- | ---------- |
| 草稿   | DRAFT     | 灰色 | 未發送     |
| 已發送 | SENT      | 藍色 | 等待付款   |
| 已付款 | PAID      | 綠色 | 完成       |
| 已逾期 | OVERDUE   | 紅色 | 超過到期日 |
| 已取消 | CANCELLED | 灰色 | 作廢       |

### 導師簽到狀態

| 狀態   | 英文       | 顏色 | 說明     |
| ------ | ---------- | ---- | -------- |
| 已排程 | SCHEDULED  | 灰色 | 待簽到   |
| 已簽到 | CHECKED_IN | 藍色 | 進行中   |
| 已完成 | COMPLETED  | 綠色 | 已簽退   |
| 缺席   | ABSENT     | 紅色 | 未到場   |
| 遲到   | LATE       | 橙色 | 超時簽到 |

---

## 📐 組件使用範例

### 狀態徽章使用

```tsx
import { Badge } from '@/components/ui/badge/Badge';

// 報價狀態
<Badge variant="light" color="success">已接受</Badge>
<Badge variant="light" color="error">已拒絕</Badge>
<Badge variant="light" color="info">已發送</Badge>

// 發票狀態
<Badge variant="solid" color="error">已逾期</Badge>
<Badge variant="solid" color="success">已付款</Badge>
```

### Modal 使用

```tsx
import { Modal } from "@/components/ui/modal";

<Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg">
  <div className="p-6">
    <h3 className="text-lg font-semibold mb-4">確認刪除</h3>
    <p>確定要刪除此報價嗎？</p>
  </div>
</Modal>;
```

### 表格使用

```tsx
import { TableDropdown } from "@/components/common/TableDropdown";

<TableDropdown
  items={[
    { label: "編輯", onClick: handleEdit },
    { label: "刪除", onClick: handleDelete, danger: true },
  ]}
/>;
```

---

## 📁 建議的組件目錄結構

```
components/
└── school-service/
    ├── common/
    │   ├── StatusBadge.tsx
    │   ├── MoneyDisplay.tsx
    │   ├── ProgressBar.tsx
    │   └── DateRangePicker.tsx
    ├── school/
    │   ├── SchoolSelector.tsx
    │   └── SchoolCard.tsx
    ├── quotation/
    │   ├── QuotationStatusBadge.tsx
    │   ├── QuotationItemForm.tsx
    │   └── QuotationPreview.tsx
    ├── course/
    │   ├── CourseCard.tsx
    │   ├── CourseStatusBadge.tsx
    │   └── BatchLessonGenerator.tsx
    ├── lesson/
    │   ├── LessonCard.tsx
    │   ├── LessonStatusBadge.tsx
    │   └── LessonTable.tsx
    ├── tutor/
    │   ├── TutorSelector.tsx
    │   ├── TutorLessonCard.tsx
    │   └── AttendanceButton.tsx
    ├── invoice/
    │   ├── InvoiceStatusBadge.tsx
    │   ├── LessonSelector.tsx
    │   └── PaymentForm.tsx
    └── schedule/
        ├── WeekView.tsx
        ├── TutorRow.tsx
        └── LessonDragItem.tsx
```

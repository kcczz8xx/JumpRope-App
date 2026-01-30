# ➕ 新增課程 - Courses New

> **路徑**: `/dashboard/school/courses/new`  
> **優先級**: P1  
> **角色**: ADMIN

---

## 📋 頁面概述

手動新增課程的表單頁面。適用於不經報價流程直接建立課程的情況（例如：長期合作學校的新課程）。

---

## 🎨 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│ ➕ 新增課程                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 步驟 1        步驟 2        步驟 3                  │   │
│  │ ●──────────────○──────────────○                     │   │
│  │ 基本資料      收費設定      確認建立                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 步驟 1：課程基本資料                                 │   │
│  │                                                      │   │
│  │ 選擇學校 *                                           │   │
│  │ [ 搜尋學校... ▼ ]                                   │   │
│  │                                                      │   │
│  │ 課程名稱 *                                           │   │
│  │ [跳繩恆常班（上學期）________________________]      │   │
│  │                                                      │   │
│  │ 課程類型 *          學期 *                          │   │
│  │ [恆常班________▼]   [上學期________▼]              │   │
│  │                                                      │   │
│  │ 學年 *                                               │   │
│  │ [2024-2025_____▼]                                   │   │
│  │                                                      │   │
│  │ 開始日期 *          結束日期                        │   │
│  │ [2024-09-09]        [2025-01-17]                    │   │
│  │                                                      │   │
│  │ 所需導師 *          最大學生數                      │   │
│  │ [2___________]      [30__________]                  │   │
│  │                                                      │   │
│  │ 課程描述                                             │   │
│  │ [適合小三至小五學生，教授基本跳繩技巧___________]   │   │
│  │ [_______________________________________________]   │   │
│  │                                                      │   │
│  │                              [ 取消 ] [ 下一步 → ] │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 使用組件

### TailAdmin 組件

| 組件         | 路徑                              | 用途     |
| ------------ | --------------------------------- | -------- |
| `Input`      | `components/form/input/`          | 文字輸入 |
| `Select`     | `components/form/Select.tsx`      | 下拉選擇 |
| `DatePicker` | `components/form/date-picker.tsx` | 日期選擇 |
| `Textarea`   | `components/form/textarea/`       | 多行文字 |
| `Button`     | `components/ui/button/`           | 操作按鈕 |

### 需開發組件

| 組件                    | 說明           |
| ----------------------- | -------------- |
| `StepIndicator`         | 步驟進度條     |
| `SchoolSelector`        | 學校搜尋選擇器 |
| `CourseTypeSelector`    | 課程類型選擇   |
| `ChargingModelSelector` | 收費模式選擇   |

---

## 📊 表單結構

### 步驟 1：基本資料

```typescript
interface Step1Data {
  schoolId: string;
  courseName: string;
  courseType: CourseType;
  courseTerm: CourseTerm;
  academicYear: string;
  startDate: Date;
  endDate: Date | null;
  requiredTutors: number;
  maxStudents: number | null;
  courseDescription: string | null;
}

enum CourseType {
  REGULAR_CLASS = "REGULAR_CLASS", // 恆常班
  SHORT_TERM = "SHORT_TERM", // 短期班
  INTEREST_CLASS = "INTEREST_CLASS", // 興趣班
  COMPETITION_PREP = "COMPETITION_PREP", // 比賽培訓
  DEMO_CLASS = "DEMO_CLASS", // 示範課
  MAKEUP_CLASS = "MAKEUP_CLASS", // 補堂
  OTHER = "OTHER", // 其他
}

enum CourseTerm {
  FIRST_TERM = "FIRST_TERM", // 上學期
  SECOND_TERM = "SECOND_TERM", // 下學期
  FULL_YEAR = "FULL_YEAR", // 全年
  SUMMER = "SUMMER", // 暑期
  OTHER = "OTHER", // 其他
}
```

### 步驟 2：收費設定

```typescript
interface Step2Data {
  chargingModel: ChargingModel;

  // 學生每節課堂收費
  studentPerLessonFee?: number;

  // 固定每節課堂收費
  fixedPerLessonFee?: number;

  // 學生每個月收費
  studentPerMonthFee?: number;

  // 固定每個月收費
  fixedPerMonthFee?: number;

  // 整個課程固定收費
  totalCourseFee?: number;

  // 導師薪資
  tutorSalaryCalculationMode: SalaryCalculationMode;
  tutorPerLessonFee?: number;
  tutorPerMonthFee?: number;
  tutorTotalCourseFee?: number;
}

enum ChargingModel {
  STUDENT_PER_LESSON = "STUDENT_PER_LESSON", // 學生每節課堂收費
  FIXED_PER_LESSON = "FIXED_PER_LESSON", // 固定每節課堂收費
  STUDENT_PER_MONTH = "STUDENT_PER_MONTH", // 學生每個月收費
  FIXED_PER_MONTH = "FIXED_PER_MONTH", // 固定每個月收費
  TOTAL_COURSE = "TOTAL_COURSE", // 整個課程固定收費
}

enum SalaryCalculationMode {
  PER_LESSON = "PER_LESSON", // 每堂計算
  PER_MONTH = "PER_MONTH", // 每月計算
  TOTAL_COURSE = "TOTAL_COURSE", // 整個課程
}
```

### 步驟 3：預覽確認

```typescript
interface CoursePreview {
  // 合併 Step1 + Step2 的資料
  ...Step1Data;
  ...Step2Data;

  // 計算欄位
  estimatedRevenue?: number;    // 預計收入
  estimatedCost?: number;       // 預計成本
  estimatedProfit?: number;     // 預計利潤
}
```

---

## 🔄 建立流程

### API 實作

```typescript
// API: POST /api/courses
async function createCourse(data: Step1Data & Step2Data) {
  // 驗證學校是否存在
  const school = await prisma.school.findUnique({
    where: { id: data.schoolId },
  });

  if (!school) throw new Error("學校不存在");

  // 驗證日期
  if (data.endDate && data.endDate < data.startDate) {
    throw new Error("結束日期不能早於開始日期");
  }

  // 建立課程
  const course = await prisma.schoolCourse.create({
    data: {
      schoolId: data.schoolId,
      courseName: data.courseName,
      courseType: data.courseType,
      courseTerm: data.courseTerm,
      academicYear: data.academicYear,
      startDate: data.startDate,
      endDate: data.endDate,
      requiredTutors: data.requiredTutors,
      maxStudents: data.maxStudents,
      courseDescription: data.courseDescription,

      chargingModel: data.chargingModel,
      studentPerLessonFee: data.studentPerLessonFee,
      fixedPerLessonFee: data.fixedPerLessonFee,
      studentPerMonthFee: data.studentPerMonthFee,
      fixedPerMonthFee: data.fixedPerMonthFee,
      totalCourseFee: data.totalCourseFee,

      tutorSalaryCalculationMode: data.tutorSalaryCalculationMode,
      tutorPerLessonFee: data.tutorPerLessonFee,
      tutorPerMonthFee: data.tutorPerMonthFee,
      tutorTotalCourseFee: data.tutorTotalCourseFee,

      status: "ACTIVE",
    },
  });

  return course;
}
```

---

## 🎯 收費模式說明

### 1. 學生每節課堂收費

```
適用：恆常班、興趣班
計算：學生人數 x 每堂收費 x 課堂數
範例：20 人 x $50 x 12 堂 = $12,000
```

### 2. 固定每節課堂收費

```
適用：小班教學、VIP 班
計算：固定收費 x 課堂數
範例：$800 x 12 堂 = $9,600
```

### 3. 學生每個月收費

```
適用：長期課程
計算：學生人數 x 每月收費 x 月數
範例：20 人 x $200 x 4 個月 = $16,000
```

### 4. 固定每個月收費

```
適用：包班制
計算：固定收費 x 月數
範例：$3,000 x 4 個月 = $12,000
```

### 5. 整個課程固定收費

```
適用：短期課程、工作坊
計算：固定總價
範例：$10,000（整個課程）
```

---

## 🎨 動態欄位顯示

### 根據收費模式顯示對應欄位

```typescript
function ChargingModelForm() {
  const [chargingModel, setChargingModel] =
    useState<ChargingModel>("STUDENT_PER_LESSON");

  return (
    <div>
      <Select
        value={chargingModel}
        onChange={setChargingModel}
        options={[
          { value: "STUDENT_PER_LESSON", label: "學生每節課堂收費" },
          { value: "FIXED_PER_LESSON", label: "固定每節課堂收費" },
          { value: "STUDENT_PER_MONTH", label: "學生每個月收費" },
          { value: "FIXED_PER_MONTH", label: "固定每個月收費" },
          { value: "TOTAL_COURSE", label: "整個課程固定收費" },
        ]}
      />

      {chargingModel === "STUDENT_PER_LESSON" && (
        <AmountInput
          name="studentPerLessonFee"
          label="每堂每位學生收費"
          prefix="HK$"
          required
        />
      )}

      {chargingModel === "FIXED_PER_LESSON" && (
        <AmountInput
          name="fixedPerLessonFee"
          label="每堂固定收費"
          prefix="HK$"
          required
        />
      )}

      {chargingModel === "STUDENT_PER_MONTH" && (
        <AmountInput
          name="studentPerMonthFee"
          label="每月每位學生收費"
          prefix="HK$"
          required
        />
      )}

      {chargingModel === "FIXED_PER_MONTH" && (
        <AmountInput
          name="fixedPerMonthFee"
          label="每月固定收費"
          prefix="HK$"
          required
        />
      )}

      {chargingModel === "TOTAL_COURSE" && (
        <AmountInput
          name="totalCourseFee"
          label="整個課程收費"
          prefix="HK$"
          required
        />
      )}
    </div>
  );
}
```

---

## ✅ 表單驗證

### 客戶端驗證

```typescript
const courseSchema = z
  .object({
    // 步驟 1
    schoolId: z.string().min(1, "請選擇學校"),
    courseName: z.string().min(1, "請輸入課程名稱"),
    courseType: z.enum([
      "REGULAR_CLASS",
      "SHORT_TERM",
      "INTEREST_CLASS",
      "COMPETITION_PREP",
      "DEMO_CLASS",
      "MAKEUP_CLASS",
      "OTHER",
    ]),
    courseTerm: z.enum([
      "FIRST_TERM",
      "SECOND_TERM",
      "FULL_YEAR",
      "SUMMER",
      "OTHER",
    ]),
    academicYear: z.string().min(1, "請選擇學年"),
    startDate: z.date(),
    endDate: z.date().nullable(),
    requiredTutors: z.number().int().positive("至少需要 1 位導師"),
    maxStudents: z.number().int().positive().nullable(),

    // 步驟 2
    chargingModel: z.enum([
      "STUDENT_PER_LESSON",
      "FIXED_PER_LESSON",
      "STUDENT_PER_MONTH",
      "FIXED_PER_MONTH",
      "TOTAL_COURSE",
    ]),
    studentPerLessonFee: z.number().positive().nullable(),
    fixedPerLessonFee: z.number().positive().nullable(),
    tutorPerLessonFee: z.number().positive().nullable(),
  })
  .refine(
    (data) => {
      // 日期驗證
      if (data.endDate && data.endDate < data.startDate) {
        return false;
      }
      return true;
    },
    {
      message: "結束日期不能早於開始日期",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      // 收費欄位驗證
      if (
        data.chargingModel === "STUDENT_PER_LESSON" &&
        !data.studentPerLessonFee
      ) {
        return false;
      }
      if (
        data.chargingModel === "FIXED_PER_LESSON" &&
        !data.fixedPerLessonFee
      ) {
        return false;
      }
      return true;
    },
    {
      message: "請填寫對應的收費金額",
      path: ["chargingModel"],
    }
  );
```

---

## 📊 預覽計算

### 預計收入計算

```typescript
function calculateEstimatedRevenue(course: CoursePreview): number {
  switch (course.chargingModel) {
    case "STUDENT_PER_LESSON":
      // 需要預計學生人數和課堂數
      const studentCount = course.maxStudents || 0;
      const estimatedLessons = 12; // 預設值
      return (
        studentCount * (course.studentPerLessonFee || 0) * estimatedLessons
      );

    case "FIXED_PER_LESSON":
      return (course.fixedPerLessonFee || 0) * 12;

    case "STUDENT_PER_MONTH":
      const months = 4; // 預設值
      return (
        (course.maxStudents || 0) * (course.studentPerMonthFee || 0) * months
      );

    case "FIXED_PER_MONTH":
      return (course.fixedPerMonthFee || 0) * 4;

    case "TOTAL_COURSE":
      return course.totalCourseFee || 0;

    default:
      return 0;
  }
}
```

### 預計成本計算

```typescript
function calculateEstimatedCost(course: CoursePreview): number {
  const estimatedLessons = 12;

  switch (course.tutorSalaryCalculationMode) {
    case "PER_LESSON":
      return (
        (course.tutorPerLessonFee || 0) *
        course.requiredTutors *
        estimatedLessons
      );

    case "PER_MONTH":
      return (course.tutorPerMonthFee || 0) * course.requiredTutors * 4;

    case "TOTAL_COURSE":
      return (course.tutorTotalCourseFee || 0) * course.requiredTutors;

    default:
      return 0;
  }
}
```

---

## 🎯 預覽頁面

### 顯示內容

```
┌──────────────────────────────────────────┐
│ 課程預覽                                 │
├──────────────────────────────────────────┤
│ 基本資料                                 │
│ • 學校：聖保羅小學                       │
│ • 課程名稱：跳繩恆常班（上學期）         │
│ • 學年學期：2024-2025 上學期             │
│ • 開始日期：2024-09-09                   │
│ • 結束日期：2025-01-17                   │
│ • 所需導師：2 人                         │
│ • 最大學生：30 人                        │
├──────────────────────────────────────────┤
│ 收費設定                                 │
│ • 收費模式：學生每節課堂收費             │
│ • 每堂每位學生：HK$ 50                   │
│ • 導師每堂薪資：HK$ 300                  │
├──────────────────────────────────────────┤
│ 財務預估（基於 12 堂課）                 │
│ • 預計收入：HK$ 12,000                   │
│ • 預計成本：HK$ 7,200                    │
│ • 預計利潤：HK$ 4,800                    │
├──────────────────────────────────────────┤
│ [ ← 返回修改 ] [ 確認建立課程 ]         │
└──────────────────────────────────────────┘
```

---

## 📌 開發注意事項

1. **學校驗證**：確認學校存在且狀態為 CONFIRMED
2. **日期驗證**：結束日期不能早於開始日期
3. **收費必填**：根據收費模式驗證對應欄位必填
4. **導師薪資**：根據薪資計算模式驗證對應欄位必填
5. **學年格式**：統一格式為 "YYYY-YYYY"（如 "2024-2025"）
6. **建立後動作**：建立成功後跳轉到課程詳情頁進行排課
7. **草稿功能**：考慮增加「儲存為草稿」功能
8. **範本功能**：考慮增加「從現有課程複製」功能

---

## 🔗 相關頁面

- **下一步**：[課程詳情 + 排課](./COURSES_DETAIL.md)
- **相關**：[課程列表](./COURSES.md)
- **相關**：[轉換為課程](./QUOTATIONS_CONVERT.md)（報價轉課程的流程）

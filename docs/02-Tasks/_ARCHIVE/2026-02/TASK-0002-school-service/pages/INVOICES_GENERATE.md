# 📝 生成發票 - Invoices Generate

> **路徑**: `/dashboard/school/invoices/generate`  
> **優先級**: P0  
> **角色**: ADMIN, FINANCE

---

## 📋 頁面概述

多步驟表單，用於從已完成課堂生成發票。支援選擇多個課程、日期範圍篩選、課堂手動勾選。

---

## 🎨 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│ 📝 生成發票                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 步驟 1        步驟 2        步驟 3        步驟 4    │   │
│  │ ●──────────────○──────────────○──────────────○      │   │
│  │ 選擇學校      選擇課堂      填寫資料      預覽確認  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 步驟 2：選擇課程與課堂                               │   │
│  │                                                      │   │
│  │ ┌────────────────────────────────────────────────┐  │   │
│  │ │ ☑ 跳繩恆常班（上學期）                         │  │   │
│  │ │                                                │  │   │
│  │ │ 課堂範圍：                                     │  │   │
│  │ │ ◉ 依日期：[2024-09-01] ~ [2024-09-30]         │  │   │
│  │ │ ○ 依堂數：第 [__] 堂 至 第 [__] 堂            │  │   │
│  │ │ ○ 手動選擇                                    │  │   │
│  │ │                                                │  │   │
│  │ │ 已完成課堂：8 堂                               │  │   │
│  │ │ 已開票：0 堂                                   │  │   │
│  │ │ 可開票：8 堂 ✓                                │  │   │
│  │ │                                                │  │   │
│  │ │ 小計：8 堂 x $50 x 20人 = $8,000              │  │   │
│  │ └────────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │ ┌────────────────────────────────────────────────┐  │   │
│  │ │ ☐ 速度跳訓練                                   │  │   │
│  │ │ ...                                            │  │   │
│  │ └────────────────────────────────────────────────┘  │   │
│  │                                                      │   │
│  │ 發票總計：HK$ 8,000                                 │   │
│  │                                                      │   │
│  │                              [ ← 上一步 ] [ 下一步 → ] │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 使用組件

### TailAdmin 組件

| 組件                 | 路徑                                        | 用途     |
| -------------------- | ------------------------------------------- | -------- |
| `CreateInvoiceTable` | `components/invoice/CreateInvoiceTable.tsx` | 參考結構 |
| `Select`             | `components/form/Select.tsx`                | 學校選擇 |
| `DatePicker`         | `components/form/date-picker.tsx`           | 日期範圍 |
| `Switch`             | `components/form/switch/`                   | 課程勾選 |
| `Modal`              | `components/ui/modal/`                      | 確認彈窗 |

### 需開發組件

| 組件                    | 說明              |
| ----------------------- | ----------------- |
| `CourseInvoiceSelector` | 課程選擇+課堂範圍 |
| `LessonCheckboxList`    | 課堂勾選列表      |
| `InvoicePreview`        | 發票預覽          |

---

## 📊 表單結構

### 步驟 1：選擇學校

```typescript
interface Step1Data {
  schoolId: string;
}
```

### 步驟 2：選擇課程與課堂

```typescript
interface Step2Data {
  courses: CourseSelection[];
}

interface CourseSelection {
  courseId: string;
  courseName: string;
  included: boolean; // 是否包含

  selectionMode: "date_range" | "lesson_range" | "manual";

  // 日期範圍模式
  dateStart?: Date;
  dateEnd?: Date;

  // 堂數範圍模式
  lessonStart?: number;
  lessonEnd?: number;

  // 手動模式
  selectedLessonIds?: string[];

  // 計算結果
  availableLessons: LessonForInvoice[];
  selectedLessons: LessonForInvoice[];
  subtotal: number;
}

interface LessonForInvoice {
  id: string;
  lessonDate: Date;
  lessonNumber: number;
  studentCount: number;
  feeLesson: number;
  invoiceStatus: InvoiceStatus;
}
```

### 步驟 3：填寫收件人資料

```typescript
interface Step3Data {
  recipientName: string;
  recipientPosition?: string;
  recipientEmail?: string;
  mailingAddress?: string;
  paymentTermsDays: number; // 預設 30
  notes?: string;
}
```

### 步驟 4：預覽確認

```typescript
interface Step4Data {
  confirmed: boolean;
  sendMethod?: "email" | "download" | "draft";
}
```

---

## 🎯 核心功能

### 1. 獲取可開票課堂

```typescript
// API: GET /api/schools/[id]/invoiceable-lessons
async function getInvoiceableLessons(schoolId: string) {
  // 獲取學校的所有活躍課程
  const courses = await prisma.schoolCourse.findMany({
    where: {
      schoolId,
      status: "ACTIVE",
      deletedAt: null,
    },
    include: {
      lessons: {
        where: {
          lessonStatus: "COMPLETED",
          invoiceStatus: "NOT_INVOICED",
          deletedAt: null,
        },
        orderBy: { lessonDate: "asc" },
      },
    },
  });

  return courses.map((course) => ({
    courseId: course.id,
    courseName: course.courseName,
    chargingModel: course.chargingModel,
    studentPerLessonFee: course.studentPerLessonFee,
    fixedPerLessonFee: course.fixedPerLessonFee,
    lessons: course.lessons.map((lesson) => ({
      id: lesson.id,
      lessonDate: lesson.lessonDate,
      lessonNumber: lesson.lessonNumber,
      studentCount: lesson.studentCount,
      feeLesson: lesson.feeLesson,
    })),
    stats: {
      completedCount: course.lessons.length,
      totalFee: course.lessons.reduce(
        (sum, l) => sum + Number(l.feeLesson || 0),
        0
      ),
    },
  }));
}
```

### 2. 課堂篩選邏輯

```typescript
function filterLessons(
  lessons: LessonForInvoice[],
  mode: "date_range" | "lesson_range" | "manual",
  options: {
    dateStart?: Date;
    dateEnd?: Date;
    lessonStart?: number;
    lessonEnd?: number;
    selectedIds?: string[];
  }
): LessonForInvoice[] {
  switch (mode) {
    case "date_range":
      return lessons.filter(
        (l) =>
          l.lessonDate >= options.dateStart! && l.lessonDate <= options.dateEnd!
      );

    case "lesson_range":
      return lessons.filter(
        (l) =>
          l.lessonNumber >= options.lessonStart! &&
          l.lessonNumber <= options.lessonEnd!
      );

    case "manual":
      return lessons.filter((l) => options.selectedIds!.includes(l.id));

    default:
      return [];
  }
}
```

### 3. 金額計算

```typescript
function calculateSubtotal(
  lessons: LessonForInvoice[],
  chargingModel: ChargingModel,
  studentPerLessonFee?: number,
  fixedPerLessonFee?: number
): number {
  switch (chargingModel) {
    case "STUDENT_PER_LESSON":
      // 使用課堂記錄的 feeLesson（已按學生人數計算）
      return lessons.reduce((sum, l) => sum + Number(l.feeLesson || 0), 0);

    case "FIXED_PER_LESSON":
      return lessons.length * (fixedPerLessonFee || 0);

    default:
      return lessons.reduce((sum, l) => sum + Number(l.feeLesson || 0), 0);
  }
}
```

### 4. 課程選擇組件

```tsx
interface CourseInvoiceSelectorProps {
  course: CourseWithLessons;
  selection: CourseSelection;
  onChange: (updates: Partial<CourseSelection>) => void;
}

export function CourseInvoiceSelector({
  course,
  selection,
  onChange,
}: CourseInvoiceSelectorProps) {
  const selectedLessons = useMemo(() => {
    if (!selection.included) return [];

    return filterLessons(course.lessons, selection.selectionMode, {
      dateStart: selection.dateStart,
      dateEnd: selection.dateEnd,
      lessonStart: selection.lessonStart,
      lessonEnd: selection.lessonEnd,
      selectedIds: selection.selectedLessonIds,
    });
  }, [selection, course.lessons]);

  const subtotal = useMemo(
    () =>
      calculateSubtotal(
        selectedLessons,
        course.chargingModel,
        course.studentPerLessonFee
      ),
    [selectedLessons, course]
  );

  // 同步更新
  useEffect(() => {
    onChange({
      selectedLessons,
      subtotal,
    });
  }, [selectedLessons, subtotal]);

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-colors",
        selection.included
          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
          : "border-gray-200 dark:border-gray-700"
      )}
    >
      {/* 標題行 */}
      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={selection.included}
            onChange={(e) => onChange({ included: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300"
          />
          <span className="font-medium">{course.courseName}</span>
        </label>

        <div className="text-sm text-gray-500">
          可開票：{course.lessons.length} 堂
        </div>
      </div>

      {selection.included && (
        <>
          {/* 選擇模式 */}
          <div className="space-y-3 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`mode-${course.id}`}
                checked={selection.selectionMode === "date_range"}
                onChange={() => onChange({ selectionMode: "date_range" })}
              />
              <span className="text-sm">依日期範圍</span>
            </label>

            {selection.selectionMode === "date_range" && (
              <div className="flex gap-2 ml-6">
                <DatePicker
                  value={selection.dateStart}
                  onChange={(d) => onChange({ dateStart: d })}
                  placeholder="開始日期"
                />
                <span className="self-center">~</span>
                <DatePicker
                  value={selection.dateEnd}
                  onChange={(d) => onChange({ dateEnd: d })}
                  placeholder="結束日期"
                />
              </div>
            )}

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`mode-${course.id}`}
                checked={selection.selectionMode === "lesson_range"}
                onChange={() => onChange({ selectionMode: "lesson_range" })}
              />
              <span className="text-sm">依堂數範圍</span>
            </label>

            {selection.selectionMode === "lesson_range" && (
              <div className="flex items-center gap-2 ml-6">
                <span className="text-sm">第</span>
                <Input
                  type="number"
                  value={selection.lessonStart || ""}
                  onChange={(e) =>
                    onChange({ lessonStart: Number(e.target.value) })
                  }
                  className="w-20"
                />
                <span className="text-sm">至</span>
                <Input
                  type="number"
                  value={selection.lessonEnd || ""}
                  onChange={(e) =>
                    onChange({ lessonEnd: Number(e.target.value) })
                  }
                  className="w-20"
                />
                <span className="text-sm">堂</span>
              </div>
            )}

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`mode-${course.id}`}
                checked={selection.selectionMode === "manual"}
                onChange={() => onChange({ selectionMode: "manual" })}
              />
              <span className="text-sm">手動選擇課堂</span>
            </label>

            {selection.selectionMode === "manual" && (
              <div className="ml-6 max-h-48 overflow-y-auto border rounded-lg p-2">
                {course.lessons.map((lesson) => (
                  <label
                    key={lesson.id}
                    className="flex items-center gap-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selection.selectedLessonIds?.includes(lesson.id)}
                      onChange={(e) => {
                        const ids = selection.selectedLessonIds || [];
                        onChange({
                          selectedLessonIds: e.target.checked
                            ? [...ids, lesson.id]
                            : ids.filter((id) => id !== lesson.id),
                        });
                      }}
                    />
                    <span className="text-sm">
                      #{lesson.lessonNumber}{" "}
                      {format(lesson.lessonDate, "MM/dd")}| {
                        lesson.studentCount
                      }人 | ${lesson.feeLesson?.toLocaleString()}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 統計 */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span>已選課堂：{selectedLessons.length} 堂</span>
              <span className="font-medium">
                小計：HK$ {subtotal.toLocaleString()}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

### 5. 生成發票 API

```typescript
// API: POST /api/invoices
export async function POST(request: Request) {
  const session = await getServerSession();

  if (!["ADMIN", "FINANCE"].includes(session?.user?.role || "")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { schoolId, courses, recipient, paymentTermsDays, sendMethod } = body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. 收集所有選中的課堂 ID
      const allLessonIds = courses.flatMap((c: CourseSelection) =>
        c.selectedLessons.map((l: LessonForInvoice) => l.id)
      );

      // 2. 計算總金額
      const totalAmount = courses.reduce(
        (sum: number, c: CourseSelection) => sum + c.subtotal,
        0
      );

      // 3. 生成發票編號
      const invoiceNumber = await generateInvoiceNumber(tx);

      // 4. 計算到期日
      const dueDate = addDays(new Date(), paymentTermsDays);

      // 5. 建立發票
      const invoice = await tx.schoolInvoice.create({
        data: {
          schoolId,
          invoiceNumber,
          invoiceDate: new Date(),
          dueDate,
          paymentTermsDays,
          invoiceAmount: totalAmount,
          paidAmount: 0,
          status: sendMethod === "draft" ? "DRAFT" : "SENT",
          recipientNameChinese: recipient.name,
          contactPosition: recipient.position,
          contactEmail: recipient.email,
          mailingAddress: recipient.address,
          sentDate: sendMethod !== "draft" ? new Date() : null,
          createdBy: session.user.id,
        },
      });

      // 6. 建立發票-課程關聯
      await tx.schoolInvoiceCourse.createMany({
        data: courses
          .filter((c: CourseSelection) => c.included)
          .map((c: CourseSelection) => ({
            invoiceId: invoice.id,
            courseId: c.courseId,
            lessonDateStart: c.selectedLessons[0]?.lessonDate,
            lessonDateEnd:
              c.selectedLessons[c.selectedLessons.length - 1]?.lessonDate,
            lessonCount: c.selectedLessons.length,
            amount: c.subtotal,
          })),
      });

      // 7. 更新課堂的開票狀態
      await tx.schoolLesson.updateMany({
        where: { id: { in: allLessonIds } },
        data: { invoiceStatus: "INVOICED" },
      });

      // 8. 建立收據記錄（待付款）
      await tx.schoolReceipt.create({
        data: {
          schoolId,
          invoiceId: invoice.id,
          receiptNumber: `REC-${invoiceNumber.replace("INV-", "")}`,
          paymentConfirmedDate: new Date(),
          actualReceivedAmount: 0,
          paymentMethod: "FPS",
          paymentStatus: "PENDING",
        },
      });

      return invoice;
    });

    // 9. 如果選擇發送郵件
    if (sendMethod === "email") {
      // 生成 PDF 並發送郵件
      // await sendInvoiceEmail(result.id);
    }

    return Response.json(result);
  } catch (error) {
    console.error("生成發票失敗:", error);
    return Response.json({ error: "生成發票失敗" }, { status: 500 });
  }
}
```

---

## 💻 程式碼範例

### 頁面主結構

```tsx
// app/(private)/dashboard/school/invoices/generate/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { PageBreadCrumb } from "@/components/common/PageBreadCrumb";
import { StepIndicator } from "@/components/school-service/common/StepIndicator";
import { Step1School } from "./components/Step1School";
import { Step2Lessons } from "./components/Step2Lessons";
import { Step3Recipient } from "./components/Step3Recipient";
import { Step4Preview } from "./components/Step4Preview";

const steps = [
  { id: 1, label: "選擇學校" },
  { id: 2, label: "選擇課堂" },
  { id: 3, label: "填寫資料" },
  { id: 4, label: "預覽確認" },
];

export default function GenerateInvoicePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<InvoiceFormData>({
    step1: null,
    step2: null,
    step3: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (sendMethod: "email" | "download" | "draft") => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId: formData.step1.schoolId,
          courses: formData.step2.courses.filter((c) => c.included),
          recipient: formData.step3,
          paymentTermsDays: formData.step3.paymentTermsDays,
          sendMethod,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (sendMethod === "download") {
          // 下載 PDF
          window.open(`/api/invoices/${result.id}/pdf`, "_blank");
        }
        router.push(`/dashboard/school/invoices/${result.id}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("生成發票失敗:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 計算總金額
  const totalAmount =
    formData.step2?.courses
      .filter((c) => c.included)
      .reduce((sum, c) => sum + c.subtotal, 0) || 0;

  return (
    <div className="max-w-4xl mx-auto">
      <PageBreadCrumb
        title="生成發票"
        items={[{ label: "發票管理", href: "/dashboard/school/invoices" }]}
      />

      {/* 步驟進度條 */}
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        onStepClick={(step) => step < currentStep && setCurrentStep(step)}
      />

      {/* 步驟內容 */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        {currentStep === 1 && (
          <Step1School
            data={formData.step1}
            onComplete={(data) => {
              setFormData((prev) => ({ ...prev, step1: data }));
              setCurrentStep(2);
            }}
            onCancel={() => router.push("/dashboard/school/invoices")}
          />
        )}

        {currentStep === 2 && (
          <Step2Lessons
            schoolId={formData.step1.schoolId}
            data={formData.step2}
            onComplete={(data) => {
              setFormData((prev) => ({ ...prev, step2: data }));
              setCurrentStep(3);
            }}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3Recipient
            schoolId={formData.step1.schoolId}
            data={formData.step3}
            onComplete={(data) => {
              setFormData((prev) => ({ ...prev, step3: data }));
              setCurrentStep(4);
            }}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Step4Preview
            formData={formData}
            totalAmount={totalAmount}
            onSubmit={handleSubmit}
            onBack={() => setCurrentStep(3)}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
```

---

## ✅ 驗收標準

- [ ] 可選擇學校
- [ ] 顯示該學校所有可開票的課程
- [ ] 可選擇多個課程
- [ ] 三種課堂篩選模式正確運作
- [ ] 金額自動計算
- [ ] 收件人資料可自動填入（從聯絡人）
- [ ] 預覽頁面顯示完整資訊
- [ ] 可儲存為草稿
- [ ] 可生成並下載 PDF
- [ ] 課堂狀態更新為已開票

# 🔄 轉換為課程 - Quotations Convert

> **路徑**: `/dashboard/school/quotations/[id]/convert`  
> **優先級**: P0  
> **角色**: ADMIN

---

## 📋 頁面概述

將已接受的報價項目轉換為實際課程。可逐一調整課程細節，支援批次建立多個課程。

---

## 🎨 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│ 🔄 轉換為課程                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────┐ ┌──────────────────────────┐   │
│  │ 📄 原報價資料（唯讀）   │ │ 📚 建立課程              │   │
│  │                         │ │                          │   │
│  │ 報價編號：Q2024-003     │ │ ┌──────────────────────┐ │   │
│  │ 學校：聖保羅小學        │ │ │ 課程 1               │ │   │
│  │                         │ │ │ ─────────────────── │ │   │
│  │ 報價項目：              │ │ │ 課程名稱 *           │ │   │
│  │ 1. 小學花式跳繩初班     │ │ │ [小學花式跳繩初班__] │ │   │
│  │    - 24 堂              │ │ │                      │ │   │
│  │    - HK$ 12,000         │ │ │ 學年 *    學期 *     │ │   │
│  │                         │ │ │ [2024-25▼] [上學期▼] │ │   │
│  │ 2. 速度跳訓練           │ │ │                      │ │   │
│  │    - 12 堂              │ │ │ 開始日期 * 結束日期  │ │   │
│  │    - HK$ 6,000          │ │ │ [2024-09-09] [____]  │ │   │
│  │                         │ │ │                      │ │   │
│  │ 總金額：HK$ 18,000      │ │ │ 所需導師 * 最大學生  │ │   │
│  │                         │ │ │ [2_______] [25____]  │ │   │
│  │                         │ │ │                      │ │   │
│  │                         │ │ │ 收費模式 *           │ │   │
│  │                         │ │ │ [學生每堂收費____▼]  │ │   │
│  │                         │ │ │                      │ │   │
│  │                         │ │ │ 學生每堂 導師每堂    │ │   │
│  │                         │ │ │ [HK$50__] [HK$300_]  │ │   │
│  │                         │ │ │                      │ │   │
│  │                         │ │ │ [✓ 確認建立此課程]   │ │   │
│  │                         │ │ └──────────────────────┘ │   │
│  │                         │ │                          │   │
│  │                         │ │ ┌──────────────────────┐ │   │
│  │                         │ │ │ 課程 2               │ │   │
│  │                         │ │ │ ...                  │ │   │
│  │                         │ │ └──────────────────────┘ │   │
│  └─────────────────────────┘ └──────────────────────────┘   │
│                                                             │
│                       [ 取消 ] [ 建立所有課程 ]            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 使用組件

### TailAdmin 組件

| 組件         | 路徑                              | 用途     |
| ------------ | --------------------------------- | -------- |
| `Input`      | `components/form/input/`          | 表單輸入 |
| `Select`     | `components/form/Select.tsx`      | 下拉選擇 |
| `DatePicker` | `components/form/date-picker.tsx` | 日期選擇 |
| `Switch`     | `components/form/switch/`         | 確認開關 |
| `Modal`      | `components/ui/modal/`            | 確認彈窗 |

---

## 📊 資料結構

### 報價資料（唯讀）

```typescript
interface QuotationForConvert {
  id: string;
  quotationNumber: string;
  school: {
    id: string;
    schoolName: string;
  };
  totalAmount: number;
  items: {
    id: string;
    courseName: string;
    courseType: CourseType;
    chargingModel: ChargingModel;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    lessonsPerWeek?: number;
    lessonDuration?: number;
    expectedStudents?: number;
    requiredTutors?: number;
  }[];
}
```

### 課程表單資料

```typescript
interface CourseFormData {
  quotationItemId: string; // 關聯的報價項目
  confirmed: boolean; // 是否確認建立

  // 課程資料
  courseName: string;
  courseType: CourseType;
  courseTerm: CourseTerm;
  academicYear: string; // "2024-2025"

  // 日期設定
  startDate: Date;
  endDate?: Date;

  // 人數設定
  requiredTutors: number;
  maxStudents?: number;

  // 收費設定
  chargingModel: ChargingModel;
  studentPerLessonFee?: number;
  studentPerTermFee?: number;
  fixedPerLessonFee?: number;
  fixedPerTermFee?: number;

  // 導師薪資
  tutorPerLessonFee?: number;
}
```

---

## 🎯 核心功能

### 1. 從報價項目預填表單

```typescript
function mapQuotationItemToCourseForm(
  item: QuotationItem,
  defaults: { academicYear: string; startDate: Date }
): CourseFormData {
  return {
    quotationItemId: item.id,
    confirmed: false,

    courseName: item.courseName,
    courseType: item.courseType,
    courseTerm: "FIRST_TERM",
    academicYear: defaults.academicYear,

    startDate: defaults.startDate,
    endDate: undefined,

    requiredTutors: item.requiredTutors || 1,
    maxStudents: item.expectedStudents,

    chargingModel: item.chargingModel,
    studentPerLessonFee:
      item.chargingModel === "STUDENT_PER_LESSON" ? item.unitPrice : undefined,
    studentPerTermFee:
      item.chargingModel === "STUDENT_PER_TERM" ? item.unitPrice : undefined,
    fixedPerLessonFee:
      item.chargingModel === "FIXED_PER_LESSON" ? item.unitPrice : undefined,
    fixedPerTermFee:
      item.chargingModel === "FIXED_PER_TERM" ? item.unitPrice : undefined,

    tutorPerLessonFee: 300, // 預設導師薪資
  };
}
```

### 2. 收費模式切換

```tsx
function ChargingModelFields({
  chargingModel,
  formData,
  onChange,
}: ChargingModelFieldsProps) {
  const fields = {
    STUDENT_PER_LESSON: (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>學生每堂收費 (HK$) *</Label>
          <Input
            type="number"
            value={formData.studentPerLessonFee || ""}
            onChange={(e) =>
              onChange({ studentPerLessonFee: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <Label>導師每堂薪資 (HK$)</Label>
          <Input
            type="number"
            value={formData.tutorPerLessonFee || ""}
            onChange={(e) =>
              onChange({ tutorPerLessonFee: Number(e.target.value) })
            }
          />
        </div>
      </div>
    ),
    STUDENT_PER_TERM: (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>學生每學期收費 (HK$) *</Label>
          <Input
            type="number"
            value={formData.studentPerTermFee || ""}
            onChange={(e) =>
              onChange({ studentPerTermFee: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <Label>導師每堂薪資 (HK$)</Label>
          <Input
            type="number"
            value={formData.tutorPerLessonFee || ""}
            onChange={(e) =>
              onChange({ tutorPerLessonFee: Number(e.target.value) })
            }
          />
        </div>
      </div>
    ),
    FIXED_PER_LESSON: (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>固定每堂收費 (HK$) *</Label>
          <Input
            type="number"
            value={formData.fixedPerLessonFee || ""}
            onChange={(e) =>
              onChange({ fixedPerLessonFee: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <Label>導師每堂薪資 (HK$)</Label>
          <Input
            type="number"
            value={formData.tutorPerLessonFee || ""}
            onChange={(e) =>
              onChange({ tutorPerLessonFee: Number(e.target.value) })
            }
          />
        </div>
      </div>
    ),
    FIXED_PER_TERM: (
      <div>
        <Label>固定每學期收費 (HK$) *</Label>
        <Input
          type="number"
          value={formData.fixedPerTermFee || ""}
          onChange={(e) =>
            onChange({ fixedPerTermFee: Number(e.target.value) })
          }
        />
      </div>
    ),
  };

  return fields[chargingModel] || null;
}
```

### 3. 批次建立課程

```typescript
// API: POST /api/quotations/[id]/convert
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { courses } = body as { courses: CourseFormData[] };

  // 只處理已確認的課程
  const confirmedCourses = courses.filter((c) => c.confirmed);

  if (confirmedCourses.length === 0) {
    return Response.json({ error: "請至少確認一個課程" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 獲取報價資料
      const quotation = await tx.schoolQuotation.findUnique({
        where: { id: params.id },
        include: { school: true },
      });

      if (!quotation) {
        throw new Error("報價不存在");
      }

      if (quotation.status !== "ACCEPTED") {
        throw new Error("只能轉換已接受的報價");
      }

      // 建立課程
      const createdCourses = await Promise.all(
        confirmedCourses.map(async (courseData) => {
          return tx.schoolCourse.create({
            data: {
              schoolId: quotation.schoolId,
              courseName: courseData.courseName,
              courseType: courseData.courseType,
              courseTerm: courseData.courseTerm,
              academicYear: courseData.academicYear,
              startDate: courseData.startDate,
              endDate: courseData.endDate,
              requiredTutors: courseData.requiredTutors,
              maxStudents: courseData.maxStudents,
              chargingModel: courseData.chargingModel,
              studentPerLessonFee: courseData.studentPerLessonFee,
              studentPerTermFee: courseData.studentPerTermFee,
              fixedPerLessonFee: courseData.fixedPerLessonFee,
              fixedPerTermFee: courseData.fixedPerTermFee,
              tutorPerLessonFee: courseData.tutorPerLessonFee,
              status: "ACTIVE",
            },
          });
        })
      );

      // 更新學校合作狀態（如果是第一次合作）
      if (quotation.school.partnershipStatus !== "CONFIRMED") {
        await tx.school.update({
          where: { id: quotation.schoolId },
          data: {
            partnershipStatus: "CONFIRMED",
            partnershipStartDate: new Date(),
            partnershipStartYear: confirmedCourses[0].academicYear,
          },
        });
      }

      return {
        quotationId: quotation.id,
        createdCourses: createdCourses.map((c) => ({
          id: c.id,
          courseName: c.courseName,
        })),
      };
    });

    return Response.json(result);
  } catch (error) {
    console.error("轉換課程失敗:", error);
    return Response.json({ error: "轉換課程失敗" }, { status: 500 });
  }
}
```

---

## 💻 程式碼範例

### 頁面主結構

```tsx
// app/(private)/dashboard/school/quotations/[id]/convert/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { PageBreadCrumb } from "@/components/common/PageBreadCrumb";
import { Modal } from "@/components/ui/modal";

export default function ConvertPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: quotation, isLoading } = useSWR(
    `/api/quotations/${params.id}`,
    fetcher
  );

  const [courseForms, setCourseForms] = useState<CourseFormData[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 初始化表單資料
  useEffect(() => {
    if (quotation?.items) {
      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear}-${currentYear + 1}`;

      setCourseForms(
        quotation.items.map((item: any) =>
          mapQuotationItemToCourseForm(item, {
            academicYear,
            startDate: new Date(),
          })
        )
      );
    }
  }, [quotation]);

  const handleCourseChange = (
    index: number,
    updates: Partial<CourseFormData>
  ) => {
    setCourseForms((prev) =>
      prev.map((form, i) => (i === index ? { ...form, ...updates } : form))
    );
  };

  const handleSubmit = async () => {
    const confirmedCount = courseForms.filter((c) => c.confirmed).length;

    if (confirmedCount === 0) {
      alert("請至少確認一個課程");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/quotations/${params.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courses: courseForms }),
      });

      const result = await response.json();

      if (response.ok) {
        // 跳轉到第一個建立的課程
        router.push(`/dashboard/school/courses/${result.createdCourses[0].id}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("轉換失敗:", error);
      alert("轉換失敗，請重試");
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">載入中...</div>;
  }

  if (!quotation || quotation.status !== "ACCEPTED") {
    return <div className="p-8 text-center text-red-500">此報價無法轉換</div>;
  }

  const confirmedCount = courseForms.filter((c) => c.confirmed).length;

  return (
    <div className="space-y-6">
      <PageBreadCrumb
        title="轉換為課程"
        items={[
          { label: "報價管理", href: "/dashboard/school/quotations" },
          {
            label: quotation.quotationNumber,
            href: `/dashboard/school/quotations/${params.id}`,
          },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左側：報價資料 */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="font-semibold mb-4">原報價資料</h3>

            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">報價編號</dt>
                <dd className="font-medium">{quotation.quotationNumber}</dd>
              </div>
              <div>
                <dt className="text-gray-500">學校</dt>
                <dd className="font-medium">{quotation.school.schoolName}</dd>
              </div>
            </dl>

            <hr className="my-4 border-gray-200 dark:border-gray-700" />

            <h4 className="font-medium mb-3">報價項目</h4>
            <ul className="space-y-3">
              {quotation.items.map((item: any, index: number) => (
                <li key={item.id} className="text-sm">
                  <div className="font-medium">
                    {index + 1}. {item.courseName}
                  </div>
                  <div className="text-gray-500">
                    {item.quantity} 堂 · HK$ {item.totalPrice.toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>

            <hr className="my-4 border-gray-200 dark:border-gray-700" />

            <div className="text-right">
              <span className="text-gray-500">總金額：</span>
              <span className="text-lg font-semibold ml-2">
                HK$ {quotation.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 右側：課程表單 */}
        <div className="lg:col-span-2 space-y-6">
          {courseForms.map((form, index) => (
            <CourseConvertForm
              key={form.quotationItemId}
              index={index}
              data={form}
              originalItem={quotation.items[index]}
              onChange={(updates) => handleCourseChange(index, updates)}
            />
          ))}

          {/* 操作按鈕 */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500">
              已確認 {confirmedCount} / {courseForms.length} 個課程
            </span>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.back()}>
                取消
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowConfirmModal(true)}
                disabled={confirmedCount === 0}
              >
                建立 {confirmedCount} 個課程
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 確認 Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">確認建立課程</h3>
          <p className="text-gray-600 mb-6">
            即將建立 {confirmedCount} 個課程，確認嗎？
          </p>

          <ul className="mb-6 space-y-2">
            {courseForms
              .filter((c) => c.confirmed)
              .map((c, i) => (
                <li key={i} className="text-sm">
                  ✓ {c.courseName}
                </li>
              ))}
          </ul>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "建立中..." : "確認建立"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
```

---

## ✅ 驗收標準

- [ ] 只有 ACCEPTED 狀態的報價可進入此頁面
- [ ] 報價項目自動預填到課程表單
- [ ] 可修改課程細節（名稱、日期、收費等）
- [ ] 收費模式切換時顯示對應欄位
- [ ] 可選擇性確認要建立的課程
- [ ] 必須至少確認一個課程才能提交
- [ ] 建立成功後跳轉到課程詳情頁
- [ ] 學校合作狀態自動更新為 CONFIRMED

# 📝 課程詳情 + 排課 - Courses Detail

> **路徑**: `/dashboard/school/courses/[id]`  
> **優先級**: P0  
> **角色**: ADMIN (編輯), SCHOOL_ADMIN/TUTOR (唯讀)

---

## 📋 頁面概述

課程詳情頁是**排課中樞**，顯示課程資料、課堂列表、日曆視圖，支援批次生成課堂和手動新增課堂。

---

## 🎨 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│ 📚 小學花式跳繩初班                           [編輯] [刪除] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📍 聖保羅小學 | 📅 2024-2025 上學期                  │   │
│  │ 👥 導師 2 人 | 💰 學生每堂 $50 | 導師每堂 $300      │   │
│  │ 📆 2024-09-09 ~ 2025-01-17                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [ 📅 日曆視圖 ] [ 📋 列表視圖 ] [ 📊 統計 ]        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────┐ ┌─────────────────────────┐   │
│  │ 📅 2024 年 11 月         │ │ 課堂列表               │   │
│  │ ┌──┬──┬──┬──┬──┬──┬──┐ │ │ ┌─────────────────────┐ │   │
│  │ │日│一│二│三│四│五│六│ │ │ │ #1 09/09 14:00     │ │   │
│  │ ├──┼──┼──┼──┼──┼──┼──┤ │ │ │ 張教練 ✅ 已完成    │ │   │
│  │ │  │  │  │  │1 │2 │3 │ │ │ │ 學生 20 人         │ │   │
│  │ ├──┼──┼──┼──┼──┼──┼──┤ │ │ └─────────────────────┘ │   │
│  │ │4 │🟢│6 │7 │8 │9 │10│ │ │ ┌─────────────────────┐ │   │
│  │ │  │14│  │  │  │  │  │ │ │ │ #2 09/16 14:00     │ │   │
│  │ │  │:00│  │  │  │  │  │ │ │ │ 張教練 ✅ 已完成    │ │   │
│  │ ├──┼──┼──┼──┼──┼──┼──┤ │ │ └─────────────────────┘ │   │
│  │ │11│🟢│13│14│15│16│17│ │ │ ┌─────────────────────┐ │   │
│  │ │  │14│  │  │  │  │  │ │ │ │ #3 09/23 14:00     │ │   │
│  │ │  │:00│  │  │  │  │  │ │ │ │ ⚠️ 未分配導師      │ │   │
│  │ └──┴──┴──┴──┴──┴──┴──┘ │ │ └─────────────────────┘ │   │
│  │                        │ │                         │   │
│  │ [批次生成] [新增單堂]  │ │ 顯示 1-10 / 共 24 堂   │   │
│  └──────────────────────────┘ └─────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📊 課程統計                                          │   │
│  │ ├─ 已完成課堂：8 堂                                  │   │
│  │ ├─ 已開票課堂：8 堂                                  │   │
│  │ ├─ 待開票課堂：0 堂                                  │   │
│  │ └─ 累計收入：HK$ 8,000                              │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 使用組件

### TailAdmin 組件

| 組件            | 路徑                                  | 用途     |
| --------------- | ------------------------------------- | -------- |
| `Calendar`      | `components/calendar/Calendar.tsx`    | 日曆視圖 |
| `Tabs`          | `components/ui/tabs/`                 | 視圖切換 |
| `Modal`         | `components/ui/modal/`                | 彈窗表單 |
| `Badge`         | `components/ui/badge/Badge.tsx`       | 狀態標籤 |
| `TableDropdown` | `components/common/TableDropdown.tsx` | 課堂操作 |

### 需開發組件

| 組件                   | 說明               |
| ---------------------- | ------------------ |
| `BatchLessonGenerator` | 批次生成課堂 Modal |
| `LessonCard`           | 課堂卡片           |
| `LessonCalendarView`   | 課堂日曆視圖       |
| `TutorAssignModal`     | 導師分配 Modal     |

---

## 📊 資料結構

### 課程詳情

```typescript
interface CourseDetail {
  id: string;
  courseName: string;
  courseType: CourseType;
  courseTerm: CourseTerm;
  academicYear: string;
  startDate: Date;
  endDate?: Date;

  school: {
    id: string;
    schoolName: string;
  };

  requiredTutors: number;
  maxStudents?: number;

  chargingModel: ChargingModel;
  studentPerLessonFee?: number;
  tutorPerLessonFee?: number;

  status: CourseStatus;

  lessons: LessonWithTutors[];

  stats: {
    totalLessons: number;
    completedLessons: number;
    invoicedLessons: number;
    totalRevenue: number;
  };
}

interface LessonWithTutors {
  id: string;
  lessonDate: Date;
  startTime: string;
  endTime: string;
  lessonNumber?: number;
  lessonType: LessonType;
  lessonStatus: LessonStatus;
  studentCount?: number;
  feeLesson?: number;
  invoiceStatus: InvoiceStatus;

  tutors: {
    id: string;
    user: {
      id: string;
      name: string;
    };
    tutorRole: TutorRole;
    attendanceStatus: AttendanceStatus;
  }[];
}
```

---

## 🎯 核心功能

### 1. 批次生成課堂

```tsx
// components/school-service/course/BatchLessonGenerator.tsx
interface BatchGeneratorProps {
  courseId: string;
  courseStartDate: Date;
  courseEndDate?: Date;
  onGenerate: () => void;
  onClose: () => void;
}

interface GenerationRule {
  weekdays: number[]; // 1-7 (週一至週日)
  startTime: string; // "14:00"
  endTime: string; // "15:30"
  startDate: Date;
  endDate: Date;
  excludeDates: Date[]; // 排除日期
}

export function BatchLessonGenerator({
  courseId,
  courseStartDate,
  courseEndDate,
  onGenerate,
  onClose,
}: BatchGeneratorProps) {
  const [rule, setRule] = useState<GenerationRule>({
    weekdays: [1], // 預設週一
    startTime: "14:00",
    endTime: "15:30",
    startDate: courseStartDate,
    endDate: courseEndDate || addMonths(courseStartDate, 4),
    excludeDates: [],
  });

  const [preview, setPreview] = useState<Date[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 預覽生成結果
  useEffect(() => {
    const dates = generateLessonDates(rule);
    setPreview(dates);
  }, [rule]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await fetch(`/api/courses/${courseId}/lessons/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rule,
          lessonDates: preview,
        }),
      });

      onGenerate();
      onClose();
    } catch (error) {
      console.error("生成失敗:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} className="max-w-lg">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">批次生成課堂</h3>

        {/* 星期選擇 */}
        <div className="mb-4">
          <Label>上課日（可多選）</Label>
          <div className="flex gap-2 mt-2">
            {["一", "二", "三", "四", "五", "六", "日"].map((day, index) => (
              <button
                key={index}
                onClick={() => {
                  const weekday = index + 1;
                  setRule((prev) => ({
                    ...prev,
                    weekdays: prev.weekdays.includes(weekday)
                      ? prev.weekdays.filter((w) => w !== weekday)
                      : [...prev.weekdays, weekday].sort(),
                  }));
                }}
                className={cn(
                  "w-10 h-10 rounded-full text-sm font-medium transition-colors",
                  rule.weekdays.includes(index + 1)
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* 時間設定 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>開始時間</Label>
            <Input
              type="time"
              value={rule.startTime}
              onChange={(e) =>
                setRule((prev) => ({ ...prev, startTime: e.target.value }))
              }
            />
          </div>
          <div>
            <Label>結束時間</Label>
            <Input
              type="time"
              value={rule.endTime}
              onChange={(e) =>
                setRule((prev) => ({ ...prev, endTime: e.target.value }))
              }
            />
          </div>
        </div>

        {/* 日期範圍 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label>開始日期</Label>
            <DatePicker
              value={rule.startDate}
              onChange={(date) =>
                setRule((prev) => ({ ...prev, startDate: date }))
              }
            />
          </div>
          <div>
            <Label>結束日期</Label>
            <DatePicker
              value={rule.endDate}
              onChange={(date) =>
                setRule((prev) => ({ ...prev, endDate: date }))
              }
            />
          </div>
        </div>

        {/* 排除日期（簡化版，可擴展為日曆選擇） */}
        <div className="mb-4">
          <Label>排除日期（假期）</Label>
          <p className="text-sm text-gray-500 mt-1">
            可在生成後手動刪除不需要的課堂
          </p>
        </div>

        {/* 預覽 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">預覽</span>
            <span className="text-primary-600 font-semibold">
              將生成 {preview.length} 個課堂
            </span>
          </div>

          {preview.length > 0 && (
            <div className="text-sm text-gray-500">
              首堂：{format(preview[0], "yyyy-MM-dd")} (
              {["日", "一", "二", "三", "四", "五", "六"][preview[0].getDay()]})
              <br />
              末堂：{format(preview[preview.length - 1], "yyyy-MM-dd")}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={preview.length === 0 || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "生成中..." : `生成 ${preview.length} 個課堂`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// 輔助函數：生成課堂日期
function generateLessonDates(rule: GenerationRule): Date[] {
  const dates: Date[] = [];
  let current = new Date(rule.startDate);

  while (current <= rule.endDate) {
    const dayOfWeek = current.getDay() === 0 ? 7 : current.getDay();

    if (rule.weekdays.includes(dayOfWeek)) {
      // 檢查是否在排除列表中
      const isExcluded = rule.excludeDates.some((d) => isSameDay(d, current));

      if (!isExcluded) {
        dates.push(new Date(current));
      }
    }

    current = addDays(current, 1);
  }

  return dates;
}
```

### 2. 課堂列表卡片

```tsx
// components/school-service/lesson/LessonCard.tsx
interface LessonCardProps {
  lesson: LessonWithTutors;
  lessonNumber: number;
  isAdmin?: boolean;
  onAssignTutor?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function LessonCard({
  lesson,
  lessonNumber,
  isAdmin,
  onAssignTutor,
  onEdit,
  onDelete,
}: LessonCardProps) {
  const hasUnassignedSlots =
    lesson.tutors.length < (lesson.requiredTutors || 1);

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-shadow hover:shadow-sm",
        lesson.lessonStatus === "COMPLETED"
          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
          : hasUnassignedSlots
          ? "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20"
          : "border-gray-200 dark:border-gray-700"
      )}
    >
      {/* 標題行 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">#{lessonNumber}</span>
          <span className="font-medium">
            {format(lesson.lessonDate, "MM/dd")} {lesson.startTime}
          </span>
          <LessonStatusBadge status={lesson.lessonStatus} />
        </div>

        {isAdmin && (
          <TableDropdown
            items={[
              { label: "編輯", onClick: onEdit },
              { label: "刪除", onClick: onDelete, danger: true },
            ]}
          />
        )}
      </div>

      {/* 導師列表 */}
      <div className="space-y-1">
        {lesson.tutors.map((tutor) => (
          <div key={tutor.id} className="flex items-center gap-2 text-sm">
            <Avatar size="sm" name={tutor.user.name} />
            <span>{tutor.user.name}</span>
            <TutorRoleBadge role={tutor.tutorRole} />
            <AttendanceStatusBadge status={tutor.attendanceStatus} />
          </div>
        ))}

        {hasUnassignedSlots && (
          <button
            onClick={onAssignTutor}
            className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700"
          >
            <PlusIcon className="h-4 w-4" />
            分配導師
          </button>
        )}
      </div>

      {/* 完成資料 */}
      {lesson.lessonStatus === "COMPLETED" && (
        <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-800 text-sm text-gray-600">
          學生 {lesson.studentCount} 人 | 收費 HK${" "}
          {lesson.feeLesson?.toLocaleString()}
        </div>
      )}
    </div>
  );
}
```

### 3. 批次生成 API

```typescript
// API: POST /api/courses/[id]/lessons/batch
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { rule, lessonDates } = body;

  try {
    const course = await prisma.schoolCourse.findUnique({
      where: { id: params.id },
    });

    if (!course) {
      return Response.json({ error: "課程不存在" }, { status: 404 });
    }

    // 獲取現有課堂數量，計算堂數
    const existingLessons = await prisma.schoolLesson.count({
      where: { courseId: params.id, deletedAt: null },
    });

    // 批次建立課堂
    const lessons = await prisma.schoolLesson.createMany({
      data: lessonDates.map((date: Date, index: number) => ({
        courseId: params.id,
        lessonDate: date,
        startTime: rule.startTime,
        endTime: rule.endTime,
        weekday: new Date(date).getDay() === 0 ? 7 : new Date(date).getDay(),
        lessonType: "REGULAR",
        lessonTerm: course.courseTerm,
        lessonNumber: existingLessons + index + 1,
        lessonStatus: "SCHEDULED",
        invoiceStatus: "NOT_INVOICED",
        paymentStatus: "UNPAID",
      })),
    });

    return Response.json({
      created: lessons.count,
      message: `成功建立 ${lessons.count} 個課堂`,
    });
  } catch (error) {
    console.error("批次生成失敗:", error);
    return Response.json({ error: "生成失敗" }, { status: 500 });
  }
}
```

---

## 💻 程式碼範例

### 頁面主結構

```tsx
// app/(private)/dashboard/school/courses/[id]/page.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { PageBreadCrumb } from "@/components/common/PageBreadCrumb";
import { Tabs, TabList, Tab, TabPanel } from "@/components/ui/tabs";
import { CourseInfoCard } from "./components/CourseInfoCard";
import { LessonCalendarView } from "./components/LessonCalendarView";
import { LessonListView } from "./components/LessonListView";
import { CourseStats } from "./components/CourseStats";
import { BatchLessonGenerator } from "./components/BatchLessonGenerator";

export default function CourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const defaultTab = searchParams.get("tab") || "calendar";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showBatchGenerator, setShowBatchGenerator] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";

  const {
    data: course,
    isLoading,
    mutate,
  } = useSWR(`/api/courses/${params.id}`, fetcher);

  if (isLoading) {
    return <div className="p-8 text-center">載入中...</div>;
  }

  if (!course) {
    return <div className="p-8 text-center text-red-500">課程不存在</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageBreadCrumb
          title={course.courseName}
          items={[{ label: "課程管理", href: "/dashboard/school/courses" }]}
        />

        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {}}>
              編輯
            </Button>
          </div>
        )}
      </div>

      {/* 課程資訊卡 */}
      <CourseInfoCard course={course} />

      {/* 視圖切換 */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabList>
          <Tab value="calendar">📅 日曆視圖</Tab>
          <Tab value="list">📋 列表視圖</Tab>
          <Tab value="stats">📊 統計</Tab>
        </TabList>

        <TabPanel value="calendar">
          <div className="flex gap-4 mb-4">
            {isAdmin && (
              <>
                <Button
                  variant="primary"
                  onClick={() => setShowBatchGenerator(true)}
                >
                  批次生成課堂
                </Button>
                <Button variant="outline">新增單堂</Button>
              </>
            )}
          </div>

          <LessonCalendarView
            lessons={course.lessons}
            onLessonClick={(lesson) => {}}
          />
        </TabPanel>

        <TabPanel value="list">
          <LessonListView
            lessons={course.lessons}
            isAdmin={isAdmin}
            onRefresh={mutate}
          />
        </TabPanel>

        <TabPanel value="stats">
          <CourseStats stats={course.stats} />
        </TabPanel>
      </Tabs>

      {/* 批次生成 Modal */}
      {showBatchGenerator && (
        <BatchLessonGenerator
          courseId={params.id}
          courseStartDate={new Date(course.startDate)}
          courseEndDate={course.endDate ? new Date(course.endDate) : undefined}
          onGenerate={() => mutate()}
          onClose={() => setShowBatchGenerator(false)}
        />
      )}
    </div>
  );
}
```

---

## ✅ 驗收標準

- [ ] 顯示課程基本資訊
- [ ] 日曆視圖正確標示有課堂的日期
- [ ] 列表視圖顯示所有課堂
- [ ] ADMIN 可批次生成課堂
- [ ] 預覽顯示正確的生成數量
- [ ] 可手動新增單堂
- [ ] 未分配導師的課堂顯示警告
- [ ] 統計資料正確計算
- [ ] 唯讀角色只能查看

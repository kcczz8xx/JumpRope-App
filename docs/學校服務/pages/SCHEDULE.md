# 🗓️ 導師排班 - Schedule

> **路徑**: `/dashboard/school/schedule`  
> **優先級**: P1  
> **角色**: ADMIN (編輯), TUTOR (唯讀自己)

---

## 📋 頁面概述

導師排班週視圖，以拖拉方式分配導師到課堂。支援時間衝突檢查和批次通知。

---

## 🎨 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│ 🗓️ 導師排班                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ◀ 上週 │ 2024 年 11 月 18-24 日 │ 下週 ▶           │   │
│  │                                                     │   │
│  │ 視圖: [週視圖●] [導師視圖○]                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────────────────────────────────┐ ┌─────────┐│
│  │ 週視圖                                      │ │待分配  ││
│  │ ┌─────┬──────┬──────┬──────┬──────┬──────┐ │ │        ││
│  │ │導師 │ 週一 │ 週二 │ 週三 │ 週四 │ 週五 │ │ │🔴 (5)  ││
│  │ ├─────┼──────┼──────┼──────┼──────┼──────┤ │ │        ││
│  │ │張教練│14:00 │      │14:00 │      │10:00 │ │ │┌─────┐││
│  │ │     │聖保羅│      │聖保羅│      │培正  │ │ ││11/25│││
│  │ │     │✅    │      │✅    │      │⏰    │ │ ││14:00│││
│  │ ├─────┼──────┼──────┼──────┼──────┼──────┤ │ ││聖保羅│││
│  │ │李教練│      │15:00 │      │15:00 │      │ │ │└─────┘││
│  │ │     │      │協恩  │      │協恩  │      │ │ │        ││
│  │ │     │      │✅    │      │✅    │      │ │ │┌─────┐││
│  │ ├─────┼──────┼──────┼──────┼──────┼──────┤ │ ││11/26│││
│  │ │王教練│10:00 │10:00 │⚠️衝突│      │14:00 │ │ ││15:00│││
│  │ │     │培正  │聖保羅│      │      │協恩  │ │ ││培正 │││
│  │ │     │✅    │⏰    │      │      │⏰    │ │ │└─────┘││
│  │ └─────┴──────┴──────┴──────┴──────┴──────┘ │ │        ││
│  │                                              │ │        ││
│  │ [自動分配] [通知所有導師] [匯出PDF]         │ │        ││
│  └────────────────────────────────────────────┘ └─────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 使用組件

### TailAdmin 組件

| 組件       | 路徑                               | 用途         |
| ---------- | ---------------------------------- | ------------ |
| `Calendar` | `components/calendar/Calendar.tsx` | 日曆基礎參考 |
| `Avatar`   | `components/ui/avatar/`            | 導師頭像     |
| `Badge`    | `components/ui/badge/Badge.tsx`    | 狀態標籤     |
| `Tooltip`  | `components/ui/tooltip/`           | 提示資訊     |

### 需開發組件

| 組件                  | 說明         |
| --------------------- | ------------ |
| `WeekSelector`        | 週選擇器     |
| `ScheduleWeekView`    | 週視圖主體   |
| `TutorRow`            | 導師行       |
| `LessonSlot`          | 課堂格子     |
| `UnassignedPanel`     | 待分配面板   |
| `DraggableLessonCard` | 可拖拉課堂卡 |

---

## 📊 資料結構

### 週視圖資料

```typescript
interface WeekScheduleData {
  weekStart: Date;
  weekEnd: Date;

  tutors: TutorSchedule[];
  unassignedLessons: UnassignedLesson[];
}

interface TutorSchedule {
  userId: string;
  userName: string;
  avatar?: string;

  // 按星期分組的課堂
  lessonsByDay: Record<number, ScheduledLesson[]>; // 1-7
}

interface ScheduledLesson {
  tutorLessonId: string;
  lessonId: string;

  lessonDate: Date;
  startTime: string;
  endTime: string;

  schoolName: string;
  courseName: string;

  tutorRole: TutorRole;
  attendanceStatus: AttendanceStatus;
}

interface UnassignedLesson {
  lessonId: string;
  lessonDate: Date;
  startTime: string;
  endTime: string;

  schoolName: string;
  courseName: string;

  requiredTutors: number;
  assignedTutors: number;
}
```

### 查詢

```typescript
// API: GET /api/schedule?weekStart=2024-11-18
async function getWeekSchedule(weekStart: Date) {
  const weekEnd = addDays(weekStart, 6);

  // 獲取所有導師
  const tutors = await prisma.user.findMany({
    where: { role: "TUTOR", deletedAt: null },
  });

  // 獲取該週所有已分配的課堂
  const tutorLessons = await prisma.schoolTutorLesson.findMany({
    where: {
      lessonDate: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    include: {
      user: { select: { id: true, name: true } },
      lesson: {
        include: {
          course: {
            include: {
              school: { select: { schoolName: true } },
            },
          },
        },
      },
    },
  });

  // 獲取該週未完全分配的課堂
  const allLessons = await prisma.schoolLesson.findMany({
    where: {
      lessonDate: {
        gte: weekStart,
        lte: weekEnd,
      },
      lessonStatus: "SCHEDULED",
    },
    include: {
      course: {
        include: {
          school: { select: { schoolName: true } },
        },
      },
      tutorLessons: true,
    },
  });

  const unassignedLessons = allLessons.filter(
    (lesson) => lesson.tutorLessons.length < lesson.course.requiredTutors
  );

  // 組裝資料
  // ...

  return { weekStart, weekEnd, tutors: tutorSchedules, unassignedLessons };
}
```

---

## 🎯 核心功能

### 1. 拖拉分配

```typescript
// 拖拉處理
interface DragDropContext {
  draggingLesson: UnassignedLesson | null;
  dropTarget: { tutorId: string; day: number } | null;
  hasConflict: boolean;
}

async function handleDrop(
  lessonId: string,
  tutorId: string,
  role: TutorRole = "ASSISTANT"
) {
  // 1. 檢查時間衝突
  const lesson = await prisma.schoolLesson.findUnique({
    where: { id: lessonId },
  });

  const conflict = await checkTimeConflict(
    tutorId,
    lesson.lessonDate,
    lesson.startTime,
    lesson.endTime
  );

  if (conflict) {
    throw new Error("導師在此時段已有其他課堂");
  }

  // 2. 建立分配記錄
  const course = await prisma.schoolCourse.findFirst({
    where: { lessons: { some: { id: lessonId } } },
  });

  await prisma.schoolTutorLesson.create({
    data: {
      lessonId,
      userId: tutorId,
      courseId: course.id,
      tutorRole: role,
      attendanceStatus: "SCHEDULED",
      lessonDate: lesson.lessonDate,
      startTime: lesson.startTime,
      endTime: lesson.endTime,
    },
  });
}
```

### 2. 時間衝突檢查

```typescript
async function checkTimeConflict(
  tutorId: string,
  date: Date,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const conflicts = await prisma.schoolTutorLesson.findMany({
    where: {
      userId: tutorId,
      lessonDate: date,
      OR: [
        // 新課堂開始時間在現有課堂時間內
        {
          AND: [
            { startTime: { lte: startTime } },
            { endTime: { gt: startTime } },
          ],
        },
        // 新課堂結束時間在現有課堂時間內
        {
          AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
        },
        // 新課堂完全包含現有課堂
        {
          AND: [
            { startTime: { gte: startTime } },
            { endTime: { lte: endTime } },
          ],
        },
      ],
    },
  });

  return conflicts.length > 0;
}
```

### 3. 課堂格子組件

```tsx
interface LessonSlotProps {
  lesson?: ScheduledLesson;
  isEmpty?: boolean;
  tutorId: string;
  day: number;
  onDrop?: (lessonId: string) => void;
  isDropTarget?: boolean;
  hasConflict?: boolean;
}

export function LessonSlot({
  lesson,
  isEmpty,
  tutorId,
  day,
  onDrop,
  isDropTarget,
  hasConflict,
}: LessonSlotProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // 設定為放置目標
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const lessonId = e.dataTransfer.getData("lessonId");
    onDrop?.(lessonId);
  };

  if (isEmpty) {
    return (
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "min-h-[80px] border-2 border-dashed rounded-lg transition-colors",
          isDropTarget && !hasConflict && "border-primary-500 bg-primary-50",
          isDropTarget && hasConflict && "border-red-500 bg-red-50",
          !isDropTarget && "border-gray-200 dark:border-gray-700"
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "min-h-[80px] p-2 rounded-lg border",
        lesson.attendanceStatus === "COMPLETED" &&
          "bg-green-50 border-green-200",
        lesson.attendanceStatus === "CHECKED_IN" &&
          "bg-blue-50 border-blue-200",
        lesson.attendanceStatus === "SCHEDULED" && "bg-white border-gray-200"
      )}
    >
      <div className="text-xs font-medium">{lesson.startTime}</div>
      <div className="text-sm truncate">{lesson.schoolName}</div>
      <div className="flex items-center gap-1 mt-1">
        <TutorRoleBadge role={lesson.tutorRole} size="sm" />
        <AttendanceStatusIcon status={lesson.attendanceStatus} />
      </div>
    </div>
  );
}
```

### 4. 可拖拉課堂卡

```tsx
interface DraggableLessonCardProps {
  lesson: UnassignedLesson;
}

export function DraggableLessonCard({ lesson }: DraggableLessonCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("lessonId", lesson.lessonId);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="p-3 rounded-lg border border-orange-200 bg-orange-50 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow dark:border-orange-800 dark:bg-orange-900/20"
    >
      <div className="text-sm font-medium">
        {format(lesson.lessonDate, "MM/dd")} {lesson.startTime}
      </div>
      <div className="text-sm text-gray-600 truncate">{lesson.schoolName}</div>
      <div className="text-xs text-gray-500 mt-1">
        需要：{lesson.requiredTutors - lesson.assignedTutors} 位導師
      </div>
    </div>
  );
}
```

---

## 💻 程式碼範例

### 頁面結構

```tsx
// app/(private)/dashboard/school/schedule/page.tsx
"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { addWeeks, subWeeks, startOfWeek, format } from "date-fns";
import { PageBreadCrumb } from "@/components/common/PageBreadCrumb";
import { WeekSelector } from "./components/WeekSelector";
import { ScheduleWeekView } from "./components/ScheduleWeekView";
import { UnassignedPanel } from "./components/UnassignedPanel";
import { TutorAssignModal } from "./components/TutorAssignModal";

export default function SchedulePage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const [assignModal, setAssignModal] = useState<{
    lessonId: string;
    tutorId: string;
  } | null>(null);

  const { data, isLoading, mutate } = useSWR(
    `/api/schedule?weekStart=${weekStart.toISOString()}`,
    fetcher
  );

  const handlePrevWeek = () => setWeekStart((prev) => subWeeks(prev, 1));
  const handleNextWeek = () => setWeekStart((prev) => addWeeks(prev, 1));

  const handleDrop = useCallback(async (lessonId: string, tutorId: string) => {
    // 打開角色選擇 Modal
    setAssignModal({ lessonId, tutorId });
  }, []);

  const handleAssignConfirm = async (role: TutorRole) => {
    if (!assignModal) return;

    try {
      await fetch("/api/schedule/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: assignModal.lessonId,
          tutorId: assignModal.tutorId,
          role,
        }),
      });

      mutate();
    } catch (error) {
      console.error("分配失敗:", error);
    } finally {
      setAssignModal(null);
    }
  };

  // TUTOR 只能查看自己的排班
  const filteredData =
    session?.user?.role === "TUTOR"
      ? {
          ...data,
          tutors: data?.tutors.filter((t: any) => t.userId === session.user.id),
        }
      : data;

  return (
    <div className="space-y-6">
      <PageBreadCrumb title="導師排班" />

      {/* 週選擇器 */}
      <WeekSelector
        weekStart={weekStart}
        onPrev={handlePrevWeek}
        onNext={handleNextWeek}
      />

      {/* 主內容 */}
      <div className="flex gap-6">
        {/* 週視圖 */}
        <div className="flex-1">
          {isLoading ? (
            <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <ScheduleWeekView
              weekStart={weekStart}
              tutors={filteredData?.tutors || []}
              onDrop={isAdmin ? handleDrop : undefined}
              readOnly={!isAdmin}
            />
          )}

          {/* 批次操作 */}
          {isAdmin && (
            <div className="flex gap-3 mt-4">
              <Button variant="outline">自動分配</Button>
              <Button variant="outline">通知所有導師</Button>
              <Button variant="outline">匯出 PDF</Button>
            </div>
          )}
        </div>

        {/* 待分配面板 */}
        {isAdmin && <UnassignedPanel lessons={data?.unassignedLessons || []} />}
      </div>

      {/* 分配確認 Modal */}
      {assignModal && (
        <TutorAssignModal
          onConfirm={handleAssignConfirm}
          onClose={() => setAssignModal(null)}
        />
      )}
    </div>
  );
}
```

---

## ✅ 驗收標準

- [ ] 週視圖正確顯示導師排班
- [ ] ADMIN 可拖拉分配課堂到導師
- [ ] 時間衝突正確檢測並阻止
- [ ] 未分配課堂顯示在右側面板
- [ ] 分配時可選擇導師角色
- [ ] TUTOR 只能查看自己的排班
- [ ] 週切換功能正常
- [ ] 狀態顏色編碼正確

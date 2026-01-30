# 📚 課程列表 - Courses

> **路徑**: `/dashboard/school/courses`  
> **優先級**: P0  
> **角色**: ADMIN (CRUD), SCHOOL_ADMIN (唯讀), TUTOR (唯讀任教課程)

---

## 📋 頁面概述

課程管理列表頁，以卡片形式顯示課程，包含進度條和基本統計。支援篩選和搜尋。

---

## 🎨 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│ 📚 課程管理                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 學年: [2024-2025▼]  狀態: [活躍▼]   [➕ 新增課程]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  │ 📚 小學花式跳繩 │ │ 🏃 速度跳訓練   │ │ 🎯 比賽培訓班  │
│  │ ────────────── │ │ ────────────── │ │ ────────────── │
│  │ 📍 聖保羅小學   │ │ 📍 培正中學     │ │ 📍 協恩中學    │
│  │ 📅 2024-25 上   │ │ 📅 2024-25 上   │ │ 📅 2024-25 全年│
│  │                 │ │                 │ │                 │
│  │ 👥 導師 2人     │ │ 👥 導師 1人     │ │ 👥 導師 3人    │
│  │ 💰 學生$50/堂   │ │ 💰 固定$800/堂  │ │ 💰 學生$60/堂  │
│  │                 │ │                 │ │                 │
│  │ 進度: ████░░ 8/24│ │ 進度: ██░░░░ 4/12│ │ 進度: █░░░░░ 2/20│
│  │                 │ │                 │ │                 │
│  │ 🟢 活躍         │ │ 🟢 活躍         │ │ 🟢 活躍        │
│  │ [查看] [排課]   │ │ [查看] [排課]   │ │ [查看] [排課]  │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘
│                                                             │
│  顯示 1-9 / 共 18 個課程                    [<] 1 2 [>]    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 使用組件

### TailAdmin 組件

| 組件             | 路徑                                | 用途         |
| ---------------- | ----------------------------------- | ------------ |
| `HorizontalCard` | `components/cards/horizontal-card/` | 課程卡片參考 |
| `Badge`          | `components/ui/badge/Badge.tsx`     | 狀態標籤     |
| `Select`         | `components/form/Select.tsx`        | 篩選下拉     |
| `Pagination`     | `components/ui/pagination/`         | 分頁         |

### 需開發組件

| 組件                | 說明                 |
| ------------------- | -------------------- |
| `CourseCard`        | 課程卡片（含進度條） |
| `CourseStatusBadge` | 課程狀態標籤         |
| `ProgressBar`       | 課堂進度條           |

---

## 📊 資料結構

### 課程卡片資料

```typescript
interface CourseCardData {
  id: string;
  courseName: string;
  courseType: CourseType;
  courseTerm: CourseTerm;
  academicYear: string;

  school: {
    id: string;
    schoolName: string;
  };

  requiredTutors: number;
  maxStudents?: number;

  chargingModel: ChargingModel;
  studentPerLessonFee?: number;
  fixedPerLessonFee?: number;

  status: CourseStatus;

  // 統計資料
  stats: {
    totalLessons: number;
    completedLessons: number;
    assignedTutors: number;
  };
}
```

### 查詢參數

```typescript
interface CourseListParams {
  academicYear?: string;
  status?: CourseStatus | "all";
  schoolId?: string; // SCHOOL_ADMIN/TUTOR 過濾
  tutorId?: string; // TUTOR 過濾
  page?: number;
  pageSize?: number;
}
```

### API 查詢

```typescript
// API: GET /api/courses
async function getCourses(params: CourseListParams, session: Session) {
  const { academicYear, status, page = 1, pageSize = 9 } = params;

  let where: Prisma.SchoolCourseWhereInput = {
    deletedAt: null,
    ...(academicYear && { academicYear }),
    ...(status && status !== "all" && { status }),
  };

  // 角色過濾
  if (session.user.role === "SCHOOL_ADMIN") {
    where.schoolId = session.user.schoolId;
  } else if (session.user.role === "TUTOR") {
    where.lessons = {
      some: {
        tutorLessons: {
          some: { userId: session.user.id },
        },
      },
    };
  }

  const [courses, total] = await Promise.all([
    prisma.schoolCourse.findMany({
      where,
      include: {
        school: { select: { id: true, schoolName: true } },
        lessons: {
          select: {
            id: true,
            lessonStatus: true,
          },
        },
        _count: {
          select: {
            lessons: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.schoolCourse.count({ where }),
  ]);

  // 計算統計
  const coursesWithStats = courses.map((course) => ({
    ...course,
    stats: {
      totalLessons: course._count.lessons,
      completedLessons: course.lessons.filter(
        (l) => l.lessonStatus === "COMPLETED"
      ).length,
      assignedTutors: new Set(
        course.lessons.flatMap(
          (l) => l.tutorLessons?.map((tl) => tl.userId) || []
        )
      ).size,
    },
  }));

  return {
    data: coursesWithStats,
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

### 1. 課程卡片

```tsx
// components/school-service/course/CourseCard.tsx
interface CourseCardProps {
  course: CourseCardData;
  onView?: () => void;
  onSchedule?: () => void;
  isAdmin?: boolean;
}

export function CourseCard({
  course,
  onView,
  onSchedule,
  isAdmin,
}: CourseCardProps) {
  const progress =
    course.stats.totalLessons > 0
      ? (course.stats.completedLessons / course.stats.totalLessons) * 100
      : 0;

  const getChargingDisplay = () => {
    switch (course.chargingModel) {
      case "STUDENT_PER_LESSON":
        return `學生 $${course.studentPerLessonFee}/堂`;
      case "FIXED_PER_LESSON":
        return `固定 $${course.fixedPerLessonFee}/堂`;
      default:
        return "-";
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow dark:border-gray-800 dark:bg-gray-900">
      {/* 標題 */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg line-clamp-1">
          {course.courseName}
        </h3>
        <CourseStatusBadge status={course.status} />
      </div>

      {/* 學校 */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
        <MapPinIcon className="h-4 w-4" />
        <span>{course.school.schoolName}</span>
      </div>

      {/* 學期 */}
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <CalendarIcon className="h-4 w-4" />
        <span>
          {course.academicYear} {courseTermLabels[course.courseTerm]}
        </span>
      </div>

      {/* 統計 */}
      <div className="flex items-center gap-4 text-sm mb-4">
        <div className="flex items-center gap-1">
          <UsersIcon className="h-4 w-4 text-gray-400" />
          <span>
            導師 {course.stats.assignedTutors}/{course.requiredTutors} 人
          </span>
        </div>
        <div className="flex items-center gap-1">
          <DollarIcon className="h-4 w-4 text-gray-400" />
          <span>{getChargingDisplay()}</span>
        </div>
      </div>

      {/* 進度條 */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-500">課堂進度</span>
          <span className="font-medium">
            {course.stats.completedLessons}/{course.stats.totalLessons}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700">
          <div
            className="h-2 bg-primary-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
          查看詳情
        </Button>
        {isAdmin && (
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={onSchedule}
          >
            排課
          </Button>
        )}
      </div>
    </div>
  );
}
```

### 2. 課程狀態標籤

```tsx
function CourseStatusBadge({ status }: { status: CourseStatus }) {
  const config: Record<CourseStatus, { color: string; text: string }> = {
    DRAFT: { color: "gray", text: "草稿" },
    ACTIVE: { color: "green", text: "活躍" },
    COMPLETED: { color: "blue", text: "已完成" },
    CANCELLED: { color: "red", text: "已取消" },
  };

  const { color, text } = config[status];

  return (
    <Badge variant="light" color={color}>
      {text}
    </Badge>
  );
}
```

### 3. 學年選項

```typescript
function generateAcademicYearOptions(): { value: string; label: string }[] {
  const currentYear = new Date().getFullYear();
  const options = [];

  // 往前 2 年，往後 1 年
  for (let i = -2; i <= 1; i++) {
    const year = currentYear + i;
    options.push({
      value: `${year}-${year + 1}`,
      label: `${year}-${year + 1}`,
    });
  }

  return options;
}
```

---

## 💻 程式碼範例

### 頁面結構

```tsx
// app/(private)/dashboard/school/courses/page.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import Link from "next/link";
import { PageBreadCrumb } from "@/components/common/PageBreadCrumb";
import { CourseCard } from "./components/CourseCard";
import { Pagination } from "@/components/ui/pagination";

export default function CoursesPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const currentYear = new Date().getFullYear();
  const defaultAcademicYear = `${currentYear}-${currentYear + 1}`;

  const [academicYear, setAcademicYear] = useState(defaultAcademicYear);
  const [status, setStatus] = useState<string>("ACTIVE");
  const [page, setPage] = useState(1);

  const isAdmin = session?.user?.role === "ADMIN";

  const queryString = new URLSearchParams({
    academicYear,
    ...(status !== "all" && { status }),
    page: page.toString(),
  }).toString();

  const { data, isLoading } = useSWR(`/api/courses?${queryString}`, fetcher);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageBreadCrumb title="課程管理" />

        {isAdmin && (
          <Link href="/dashboard/school/courses/new">
            <Button variant="primary">
              <PlusIcon className="h-4 w-4 mr-2" />
              新增課程
            </Button>
          </Link>
        )}
      </div>

      {/* 篩選器 */}
      <div className="flex flex-wrap gap-4">
        <Select
          value={academicYear}
          onChange={setAcademicYear}
          options={generateAcademicYearOptions()}
          className="w-40"
        />

        <Select
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          options={[
            { value: "all", label: "全部狀態" },
            { value: "ACTIVE", label: "活躍" },
            { value: "COMPLETED", label: "已完成" },
            { value: "DRAFT", label: "草稿" },
            { value: "CANCELLED", label: "已取消" },
          ]}
          className="w-32"
        />
      </div>

      {/* 課程卡片網格 */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl bg-gray-100 animate-pulse dark:bg-gray-800"
            />
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-12 text-gray-500">沒有課程記錄</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data.map((course: CourseCardData) => (
              <CourseCard
                key={course.id}
                course={course}
                isAdmin={isAdmin}
                onView={() =>
                  router.push(`/dashboard/school/courses/${course.id}`)
                }
                onSchedule={() =>
                  router.push(
                    `/dashboard/school/courses/${course.id}?tab=schedule`
                  )
                }
              />
            ))}
          </div>

          {/* 分頁 */}
          {data?.pagination && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                顯示 {(data.pagination.page - 1) * data.pagination.pageSize + 1}
                -
                {Math.min(
                  data.pagination.page * data.pagination.pageSize,
                  data.pagination.total
                )}{" "}
                / 共 {data.pagination.total} 個課程
              </span>
              <Pagination
                currentPage={data.pagination.page}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

---

## 📱 響應式設計

| 斷點                    | 卡片列數 |
| ----------------------- | -------- |
| mobile (< 768px)        | 1 列     |
| tablet (768px - 1024px) | 2 列     |
| desktop (> 1024px)      | 3 列     |

---

## ✅ 驗收標準

- [ ] ADMIN 可查看所有課程
- [ ] SCHOOL_ADMIN 只能查看自己學校的課程
- [ ] TUTOR 只能查看自己任教的課程
- [ ] 學年篩選正確運作
- [ ] 狀態篩選正確運作
- [ ] 進度條顯示正確比例
- [ ] 點擊卡片跳轉到詳情頁
- [ ] ADMIN 可新增課程
- [ ] 響應式卡片網格正常運作

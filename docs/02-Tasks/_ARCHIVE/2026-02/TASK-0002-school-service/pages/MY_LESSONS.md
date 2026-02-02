# 👨‍🏫 我的課堂 - My Lessons

> **路徑**: `/dashboard/school/my-lessons`  
> **優先級**: P0  
> **角色**: TUTOR (主要), ADMIN (查看模式)

---

## 📋 頁面概述

導師專用頁面，顯示個人的課堂排程、簽到/簽退功能，以及薪資預覽。設計以手機優先，方便導師在外場使用。

---

## 🎨 頁面結構

```
┌─────────────────────────────────────────────────────────────┐
│ 👨‍🏫 我的課堂                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📅 今天 | 本週 | 本月 | 自訂                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🟢 今天 14:00 - 15:30                               │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │ 📍 聖保羅小學                                       │   │
│  │ 📚 花式跳繩初班                                     │   │
│  │ 👥 學生：25 人 | 🏷️ 主教                            │   │
│  │                                                     │   │
│  │ ✅ 已簽到 14:05                                     │   │
│  │                                                     │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │   │
│  │ │   簽退     │ │  查看詳情  │ │  查看路線  │    │   │
│  │ └─────────────┘ └─────────────┘ └─────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔵 明天 10:00 - 11:00                               │   │
│  │ ──────────────────────────────────────────────────  │   │
│  │ 📍 培正中學                                         │   │
│  │ 📚 速度跳訓練                                       │   │
│  │ 👥 預計 30 人 | 🏷️ 助教                             │   │
│  │                                                     │   │
│  │ ⏰ 待簽到                                           │   │
│  │                                                     │   │
│  │ ┌─────────────┐ ┌─────────────┐                    │   │
│  │ │  查看詳情  │ │  查看路線  │                    │   │
│  │ └─────────────┘ └─────────────┘                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 💰 本月薪資預覽                                     │   │
│  │ ├─ 已完成：12 堂                                    │   │
│  │ ├─ 待確認薪資：HK$ 4,800                           │   │
│  │ └─ [ 查看詳細薪資單 ]                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 使用組件

### TailAdmin 組件

| 組件         | 路徑                              | 用途           |
| ------------ | --------------------------------- | -------------- |
| `Tabs`       | `components/ui/tabs/`             | 日期篩選       |
| `Badge`      | `components/ui/badge/Badge.tsx`   | 狀態/角色標籤  |
| `Button`     | `components/ui/button/`           | 操作按鈕       |
| `Modal`      | `components/ui/modal/`            | 簽到確認 Modal |
| `DatePicker` | `components/form/date-picker.tsx` | 自訂日期       |

### 需開發組件

| 組件                | 說明                      |
| ------------------- | ------------------------- |
| `TutorLessonCard`   | 導師課堂卡片              |
| `AttendanceButton`  | 簽到/簽退按鈕             |
| `CheckInModal`      | 簽到 Modal（含拍照、GPS） |
| `SalarySummaryCard` | 薪資預覽卡片              |

---

## 📊 資料結構

### 課堂資料

```typescript
interface TutorLessonView {
  id: string; // SchoolTutorLesson.id
  lessonId: string;

  // 時間資料
  lessonDate: Date;
  startTime: string; // "14:00"
  endTime: string; // "15:30"

  // 課程資料
  courseName: string;
  courseType: CourseType;

  // 學校資料
  schoolName: string;
  schoolAddress: string;

  // 導師資料
  tutorRole: TutorRole; // HEAD_COACH | ASSISTANT | TRAINEE

  // 簽到狀態
  attendanceStatus: AttendanceStatus;
  checkInTime?: Date;
  checkOutTime?: Date;

  // 課堂資料
  expectedStudents?: number;
  actualStudents?: number;
  lessonStatus: LessonStatus;
}
```

### 資料查詢

```typescript
// API: GET /api/tutor/lessons
async function getTutorLessons(
  userId: string,
  dateRange: { start: Date; end: Date }
) {
  return await prisma.schoolTutorLesson.findMany({
    where: {
      userId,
      lessonDate: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
    include: {
      lesson: {
        include: {
          course: {
            include: {
              school: {
                select: {
                  id: true,
                  schoolName: true,
                  address: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: [{ lessonDate: "asc" }, { startTime: "asc" }],
  });
}
```

---

## 🎯 核心功能

### 1. 日期篩選

```typescript
type DateFilter = "today" | "this_week" | "this_month" | "custom";

function getDateRange(
  filter: DateFilter,
  customRange?: { start: Date; end: Date }
) {
  const now = new Date();

  switch (filter) {
    case "today":
      return {
        start: startOfDay(now),
        end: endOfDay(now),
      };
    case "this_week":
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case "this_month":
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
      };
    case "custom":
      return customRange!;
  }
}
```

### 2. 簽到功能

```typescript
// API: POST /api/tutor/lessons/[id]/check-in
interface CheckInRequest {
  lessonId: string;
  checkInImage?: string; // Base64 圖片
  geoLocation?: {
    latitude: number;
    longitude: number;
  };
}

async function checkIn(data: CheckInRequest) {
  const now = new Date();

  // 檢查是否為今天的課堂
  const tutorLesson = await prisma.schoolTutorLesson.findFirst({
    where: {
      lessonId: data.lessonId,
      userId: session.user.id,
    },
    include: { lesson: true },
  });

  if (!tutorLesson) {
    throw new Error("您未被分配到此課堂");
  }

  if (!isSameDay(tutorLesson.lessonDate, now)) {
    throw new Error("只能簽到今天的課堂");
  }

  // 更新簽到記錄
  return await prisma.schoolTutorLesson.update({
    where: { id: tutorLesson.id },
    data: {
      attendanceStatus: "CHECKED_IN",
      checkInTime: now,
      checkInImage: data.checkInImage,
      geoLocation: data.geoLocation
        ? `${data.geoLocation.latitude},${data.geoLocation.longitude}`
        : null,
    },
  });
}
```

### 3. 簽退功能

```typescript
// API: POST /api/tutor/lessons/[id]/check-out
interface CheckOutRequest {
  lessonId: string;
  actualStudents: number; // 實際學生人數
  notes?: string;
}

async function checkOut(data: CheckOutRequest) {
  const now = new Date();

  const tutorLesson = await prisma.schoolTutorLesson.findFirst({
    where: {
      lessonId: data.lessonId,
      userId: session.user.id,
      attendanceStatus: "CHECKED_IN",
    },
  });

  if (!tutorLesson) {
    throw new Error("請先簽到");
  }

  // 計算工作時長
  const workingMinutes = differenceInMinutes(now, tutorLesson.checkInTime!);

  // 計算薪資
  const salaryAmount = calculateSalary(tutorLesson, workingMinutes);

  // 更新記錄
  await prisma.$transaction([
    prisma.schoolTutorLesson.update({
      where: { id: tutorLesson.id },
      data: {
        attendanceStatus: "COMPLETED",
        checkOutTime: now,
        workingMinutes,
        salaryAmount,
      },
    }),
    // 同時更新課堂記錄
    prisma.schoolLesson.update({
      where: { id: data.lessonId },
      data: {
        studentCount: data.actualStudents,
        lessonStatus: "COMPLETED",
        notes: data.notes,
      },
    }),
  ]);
}
```

---

## 🎨 卡片狀態設計

### 狀態顏色

| 狀態       | 邊框顏色           | 背景色        | 說明         |
| ---------- | ------------------ | ------------- | ------------ |
| 今天待簽到 | `border-blue-500`  | `bg-blue-50`  | 今天的課堂   |
| 已簽到     | `border-green-500` | `bg-green-50` | 進行中       |
| 已完成     | `border-gray-300`  | `bg-gray-50`  | 已簽退       |
| 未來課堂   | `border-gray-200`  | `bg-white`    | 未來日期     |
| 已過期     | `border-red-300`   | `bg-red-50`   | 過去但未簽到 |

### 狀態徽章

```tsx
function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  const config = {
    SCHEDULED: { color: "gray", text: "待簽到" },
    CHECKED_IN: { color: "blue", text: "已簽到" },
    COMPLETED: { color: "green", text: "已完成" },
    ABSENT: { color: "red", text: "缺席" },
    LATE: { color: "orange", text: "遲到" },
  };

  const { color, text } = config[status];

  return (
    <Badge variant="light" color={color}>
      {text}
    </Badge>
  );
}
```

### 角色徽章

```tsx
function TutorRoleBadge({ role }: { role: TutorRole }) {
  const config = {
    HEAD_COACH: { color: "primary", text: "主教" },
    ASSISTANT: { color: "info", text: "助教" },
    TRAINEE: { color: "warning", text: "實習" },
  };

  const { color, text } = config[role];

  return (
    <Badge variant="solid" color={color}>
      {text}
    </Badge>
  );
}
```

---

## 💻 程式碼範例

### 頁面結構

```tsx
// app/(private)/dashboard/school/my-lessons/page.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { PageBreadCrumb } from "@/components/common/PageBreadCrumb";
import { DateFilterTabs } from "./components/DateFilterTabs";
import { TutorLessonCard } from "./components/TutorLessonCard";
import { SalarySummaryCard } from "./components/SalarySummaryCard";
import { CheckInModal } from "./components/CheckInModal";
import { CheckOutModal } from "./components/CheckOutModal";

export default function MyLessonsPage() {
  const { data: session } = useSession();
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [customRange, setCustomRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<TutorLessonView | null>(
    null
  );
  const [modalType, setModalType] = useState<"checkin" | "checkout" | null>(
    null
  );

  const dateRange = getDateRange(dateFilter, customRange || undefined);

  const { data: lessons, mutate } = useSWR(
    `/api/tutor/lessons?start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}`,
    fetcher
  );

  const handleCheckIn = (lesson: TutorLessonView) => {
    setSelectedLesson(lesson);
    setModalType("checkin");
  };

  const handleCheckOut = (lesson: TutorLessonView) => {
    setSelectedLesson(lesson);
    setModalType("checkout");
  };

  const handleModalClose = () => {
    setSelectedLesson(null);
    setModalType(null);
    mutate(); // 重新獲取資料
  };

  // 分組：今天 / 未來
  const todayLessons = lessons?.filter((l) => isToday(l.lessonDate)) || [];
  const futureLessons =
    lessons?.filter((l) => isAfter(l.lessonDate, new Date())) || [];
  const pastLessons =
    lessons?.filter((l) => isBefore(l.lessonDate, startOfDay(new Date()))) ||
    [];

  return (
    <div className="space-y-6">
      <PageBreadCrumb title="我的課堂" />

      {/* 日期篩選 */}
      <DateFilterTabs
        value={dateFilter}
        onChange={setDateFilter}
        customRange={customRange}
        onCustomRangeChange={setCustomRange}
      />

      {/* 課堂列表 */}
      <div className="space-y-4">
        {/* 今天的課堂 */}
        {todayLessons.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">今天</h2>
            <div className="space-y-3">
              {todayLessons.map((lesson) => (
                <TutorLessonCard
                  key={lesson.id}
                  lesson={lesson}
                  isToday
                  onCheckIn={() => handleCheckIn(lesson)}
                  onCheckOut={() => handleCheckOut(lesson)}
                />
              ))}
            </div>
          </section>
        )}

        {/* 未來課堂 */}
        {futureLessons.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">即將到來</h2>
            <div className="space-y-3">
              {futureLessons.map((lesson) => (
                <TutorLessonCard key={lesson.id} lesson={lesson} />
              ))}
            </div>
          </section>
        )}

        {/* 空狀態 */}
        {lessons?.length === 0 && (
          <div className="text-center py-12 text-gray-500">沒有課堂記錄</div>
        )}
      </div>

      {/* 薪資預覽 */}
      <SalarySummaryCard userId={session?.user?.id} />

      {/* 簽到 Modal */}
      {modalType === "checkin" && selectedLesson && (
        <CheckInModal lesson={selectedLesson} onClose={handleModalClose} />
      )}

      {/* 簽退 Modal */}
      {modalType === "checkout" && selectedLesson && (
        <CheckOutModal lesson={selectedLesson} onClose={handleModalClose} />
      )}
    </div>
  );
}
```

### TutorLessonCard 組件

```tsx
// components/school-service/tutor/TutorLessonCard.tsx
interface TutorLessonCardProps {
  lesson: TutorLessonView;
  isToday?: boolean;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
}

export function TutorLessonCard({
  lesson,
  isToday = false,
  onCheckIn,
  onCheckOut,
}: TutorLessonCardProps) {
  const canCheckIn = isToday && lesson.attendanceStatus === "SCHEDULED";
  const canCheckOut = lesson.attendanceStatus === "CHECKED_IN";

  // 根據狀態決定卡片樣式
  const cardClasses = cn(
    "rounded-xl border-2 p-4 transition-shadow hover:shadow-md",
    {
      "border-blue-500 bg-blue-50 dark:bg-blue-900/20":
        isToday && lesson.attendanceStatus === "SCHEDULED",
      "border-green-500 bg-green-50 dark:bg-green-900/20":
        lesson.attendanceStatus === "CHECKED_IN",
      "border-gray-300 bg-gray-50 dark:bg-gray-800":
        lesson.attendanceStatus === "COMPLETED",
      "border-gray-200 bg-white dark:bg-gray-900":
        !isToday && lesson.attendanceStatus === "SCHEDULED",
    }
  );

  return (
    <div className={cardClasses}>
      {/* 時間標題 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">
            {format(lesson.lessonDate, "M月d日")} {lesson.startTime} -{" "}
            {lesson.endTime}
          </span>
          {isToday && (
            <Badge variant="solid" color="primary">
              今天
            </Badge>
          )}
        </div>
        <AttendanceStatusBadge status={lesson.attendanceStatus} />
      </div>

      {/* 課程資訊 */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <MapPinIcon className="h-4 w-4" />
          <span>{lesson.schoolName}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <BookIcon className="h-4 w-4" />
          <span>{lesson.courseName}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <UsersIcon className="h-4 w-4" />
            <span>
              {lesson.actualStudents
                ? `${lesson.actualStudents} 人`
                : `預計 ${lesson.expectedStudents || "?"} 人`}
            </span>
          </div>
          <TutorRoleBadge role={lesson.tutorRole} />
        </div>
      </div>

      {/* 簽到時間 */}
      {lesson.checkInTime && (
        <div className="text-sm text-green-600 mb-4">
          ✅ 已簽到 {format(lesson.checkInTime, "HH:mm")}
        </div>
      )}

      {/* 操作按鈕 */}
      <div className="flex flex-wrap gap-2">
        {canCheckIn && (
          <Button
            onClick={onCheckIn}
            className="flex-1 min-h-[48px]"
            variant="primary"
          >
            簽到
          </Button>
        )}

        {canCheckOut && (
          <Button
            onClick={onCheckOut}
            className="flex-1 min-h-[48px]"
            variant="success"
          >
            簽退
          </Button>
        )}

        <Button
          onClick={() =>
            window.open(getGoogleMapsUrl(lesson.schoolAddress), "_blank")
          }
          variant="outline"
          className="min-h-[48px]"
        >
          查看路線
        </Button>
      </div>
    </div>
  );
}
```

### CheckInModal 組件

```tsx
// components/school-service/tutor/CheckInModal.tsx
interface CheckInModalProps {
  lesson: TutorLessonView;
  onClose: () => void;
}

export function CheckInModal({ lesson, onClose }: CheckInModalProps) {
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 獲取 GPS 位置
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setLocation(position.coords),
        (err) => console.warn("無法獲取位置:", err)
      );
    }
  }, []);

  const handleCapture = (imageData: string) => {
    setImage(imageData);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      await fetch(`/api/tutor/lessons/${lesson.lessonId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkInImage: image,
          geoLocation: location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
              }
            : null,
        }),
      });

      onClose();
    } catch (err) {
      setError("簽到失敗，請重試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} className="max-w-md">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4">簽到確認</h3>

        <div className="mb-4">
          <p className="text-gray-600">
            {lesson.schoolName} - {lesson.courseName}
          </p>
          <p className="text-gray-600">
            {format(lesson.lessonDate, "yyyy年M月d日")} {lesson.startTime}
          </p>
        </div>

        {/* 相機拍照 */}
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">拍攝現場相片（可選）</p>
          <CameraCapture onCapture={handleCapture} />
          {image && (
            <img
              src={image}
              alt="簽到相片"
              className="mt-2 rounded-lg max-h-48"
            />
          )}
        </div>

        {/* GPS 位置 */}
        <div className="mb-4 text-sm text-gray-500">
          {location ? (
            <span>📍 已獲取位置</span>
          ) : (
            <span>⏳ 正在獲取位置...</span>
          )}
        </div>

        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1"
          >
            {loading ? "簽到中..." : "確認簽到"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

---

## 📱 響應式設計

此頁面以**手機優先**設計：

| 元素     | 手機             | 桌面           |
| -------- | ---------------- | -------------- |
| 卡片寬度 | 100%             | max-w-2xl 居中 |
| 按鈕高度 | min-h-[48px]     | min-h-[40px]   |
| 字體大小 | 略大（方便觸控） | 標準           |
| 間距     | 較大             | 標準           |

---

## ✅ 驗收標準

- [ ] 導師可查看自己的課堂列表
- [ ] 日期篩選正確運作
- [ ] 只能簽到當天的課堂
- [ ] 簽到需先簽到才能簽退
- [ ] 簽到可拍照並記錄 GPS
- [ ] 簽退需填寫實際學生人數
- [ ] 薪資預覽顯示正確
- [ ] ADMIN 可查看所有導師的課堂（唯讀）
- [ ] 手機端操作流暢

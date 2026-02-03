"use client";

import Link from "next/link";
import {
  DataTable,
  DataTableColumn,
} from "@/components/tailadmin/common/data-table";
import {
  LessonStatus,
  LessonWithDetails,
  LESSON_STATUS_LABELS,
  LESSON_STATUS_COLORS,
} from "../types";
import { getWeekdayName } from "@/lib/mock-data/school-service/client";

interface LessonListProps {
  lessons: LessonWithDetails[];
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("zh-HK", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function LessonList({ lessons }: LessonListProps) {
  const columns: DataTableColumn<LessonWithDetails>[] = [
    {
      key: "course",
      label: "課程",
      sortable: true,
      render: (lesson) => (
        <div>
          <div className="font-medium text-gray-800 dark:text-white">
            {lesson.course.courseName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {lesson.school.schoolName}
          </div>
        </div>
      ),
    },
    {
      key: "lessonDate",
      label: "日期",
      sortable: true,
      render: (lesson) => (
        <div>
          <div className="text-sm text-gray-800 dark:text-white">
            {formatDate(lesson.lessonDate)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            星期{getWeekdayName(lesson.weekday)}
          </div>
        </div>
      ),
    },
    {
      key: "time",
      label: "時間",
      render: (lesson) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {lesson.startTime} - {lesson.endTime}
        </span>
      ),
    },
    {
      key: "attendance",
      label: "人數",
      render: (lesson) => (
        <div className="text-sm">
          <div className="text-gray-600 dark:text-gray-300">
            <span className="font-medium">導師</span>{" "}
            <span
              className={
                lesson.assignedTutors < lesson.requiredTutors
                  ? "text-warning-500"
                  : "text-success-500"
              }
            >
              {lesson.assignedTutors}/{lesson.requiredTutors}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            學生 {lesson.studentCount !== null ? lesson.studentCount : "-"}
          </div>
        </div>
      ),
    },
    {
      key: "lessonStatus",
      label: "狀態",
      sortable: true,
      render: (lesson) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            LESSON_STATUS_COLORS[lesson.lessonStatus]
          }`}
        >
          {LESSON_STATUS_LABELS[lesson.lessonStatus]}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (lesson) => (
        <Link
          href={`/dashboard/school/lessons/${lesson.id}`}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-brand-500 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10 transition-colors"
        >
          查看詳情
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      title="課堂列表"
      description="管理所有學校的課堂"
      columns={columns}
      data={lessons}
      filters={[
        {
          key: "lessonStatus",
          label: "狀態",
          type: "select",
          options: Object.entries(LESSON_STATUS_LABELS).map(
            ([value, label]) => ({
              label,
              value,
            })
          ),
        },
      ]}
      searchable
      searchPlaceholder="搜尋學校或課程..."
      searchKeys={["school.schoolName", "course.courseName"]}
      pagination
      pageSize={10}
      showPageSizeSelector
      emptyMessage="暫無課堂"
    />
  );
}

"use client";

import Link from "next/link";
import { DataTable, DataTableColumn } from "@/components/tailadmin/common/data-table";
import TableDropdown from "@/components/tailadmin/common/TableDropdown";
import {
  CourseStatus,
  COURSE_TERM_LABELS,
} from "@/components/feature/school-service/types/course";
import { CourseWithSchool as Course } from "@/lib/mock-data/school-service/client";

const STATUS_LABELS: Record<CourseStatus, string> = {
  [CourseStatus.DRAFT]: "草稿",
  [CourseStatus.SCHEDULED]: "已排程",
  [CourseStatus.ACTIVE]: "進行中",
  [CourseStatus.COMPLETED]: "已完成",
  [CourseStatus.CANCELLED]: "已取消",
  [CourseStatus.SUSPENDED]: "已暫停",
};

const STATUS_COLORS: Record<CourseStatus, string> = {
  [CourseStatus.DRAFT]:
    "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  [CourseStatus.SCHEDULED]:
    "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  [CourseStatus.ACTIVE]:
    "bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400",
  [CourseStatus.COMPLETED]:
    "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  [CourseStatus.CANCELLED]:
    "bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400",
  [CourseStatus.SUSPENDED]:
    "bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400",
};

interface CourseListProps {
  courses: Course[];
}

export function CourseList({ courses }: CourseListProps) {
  const columns: DataTableColumn<Course>[] = [
    {
      key: "courseName",
      label: "課程",
      sortable: true,
      render: (course) => (
        <div>
          <div className="font-medium text-gray-800 dark:text-white">
            {course.courseName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {course.academicYear}
          </div>
        </div>
      ),
    },
    {
      key: "school",
      label: "學校",
      sortable: true,
      render: (course) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {course.school.schoolName}
        </span>
      ),
    },
    {
      key: "courseType",
      label: "類型/學期",
      sortable: true,
      render: (course) => (
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {course.courseType}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {COURSE_TERM_LABELS[course.courseTerm]}
          </div>
        </div>
      ),
    },
    {
      key: "lessons",
      label: "課堂數",
      render: (course) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {course._count.lessons} 堂
        </span>
      ),
    },
    {
      key: "status",
      label: "狀態",
      sortable: true,
      render: (course) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            STATUS_COLORS[course.status]
          }`}
        >
          {STATUS_LABELS[course.status]}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (course) => (
        <TableDropdown
          dropdownButton={
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.99902 10.245C6.96552 10.245 7.74902 11.0285 7.74902 11.995V12.005C7.74902 12.9715 6.96552 13.755 5.99902 13.755C5.03253 13.755 4.24902 12.9715 4.24902 12.005V11.995C4.24902 11.0285 5.03253 10.245 5.99902 10.245ZM17.999 10.245C18.9655 10.245 19.749 11.0285 19.749 11.995V12.005C19.749 12.9715 18.9655 13.755 17.999 13.755C17.0325 13.755 16.249 12.9715 16.249 12.005V11.995C16.249 11.0285 17.0325 10.245 17.999 10.245ZM13.749 11.995C13.749 11.0285 12.9655 10.245 11.999 10.245C11.0325 10.245 10.249 11.0285 10.249 11.995V12.005C10.249 12.9715 11.0325 13.755 11.999 13.755C12.9655 13.755 13.749 12.9715 13.749 12.005V11.995Z"
                  fill=""
                />
              </svg>
            </button>
          }
          dropdownContent={
            <>
              <Link
                href={`/dashboard/school/courses/${course.id}`}
                className="flex w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                查看詳情
              </Link>
              <Link
                href={`/dashboard/school/courses/${course.id}/edit`}
                className="flex w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                編輯課程
              </Link>
              <Link
                href={`/dashboard/school/courses/${course.id}/lessons`}
                className="flex w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
              >
                課堂管理
              </Link>
              <button
                onClick={() => console.log("Delete course:", course.id)}
                className="flex w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-error-500 hover:bg-error-50 hover:text-error-600 dark:text-error-400 dark:hover:bg-error-500/10 dark:hover:text-error-300"
              >
                刪除課程
              </button>
            </>
          }
        />
      ),
    },
  ];

  return (
    <DataTable
      title="課程列表"
      description="管理所有學校的課程"
      columns={columns}
      data={courses}
      actions={[
        {
          label: "新增課程",
          href: "/dashboard/school/courses/new",
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
          options: Object.entries(STATUS_LABELS).map(([value, label]) => ({
            label,
            value,
          })),
        },
      ]}
      searchable
      searchPlaceholder="搜尋課程或學校..."
      selectable
      pagination
      pageSize={10}
      emptyMessage="暫無課程"
      emptyAction={{
        label: "新增第一個課程",
        href: "/dashboard/school/courses/new",
      }}
    />
  );
}

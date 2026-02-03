"use client";

import React from "react";
import Link from "next/link";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronDownIcon, EyeIcon, CalenderIcon, UserIcon, PageIcon, PencilIcon } from "@/icons";
import { CourseData, COURSE_TERM_MAP, COURSE_STATUS_MAP } from "./types";
import { InfoRow, ProgressBar, QuickActionButton, FeeCard } from "./CourseCardHelpers";

interface CourseCardItemProps {
  course: CourseData;
}

export default function CourseCardItem({ course }: CourseCardItemProps) {
  const statusInfo = COURSE_STATUS_MAP[course.status] || {
    label: course.status,
    color: "bg-gray-100 text-gray-800",
  };

  return (
    <Disclosure>
      {({ open }) => (
        <div className="rounded-xl border border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
          <DisclosureButton className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-xl">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-theme-sm font-semibold text-gray-800 dark:text-white truncate">
                  {course.courseName}
                </h4>
                <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-theme-xs font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-theme-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">{course.courseType}</span>
                <span>{COURSE_TERM_MAP[course.courseTerm] || course.courseTerm}</span>
                {course.lessonStats ? (
                  <span className="text-brand-600 dark:text-brand-400">
                    {course.lessonStats.completed}/{course.lessonStats.total} 堂已完成
                  </span>
                ) : course._count?.lessons !== undefined && (
                  <span>{course._count.lessons} 堂</span>
                )}
                {course.requiredTutors > 0 && (
                  <span>{course.requiredTutors} 位導師</span>
                )}
              </div>
            </div>
            <ChevronDownIcon
              className={`ml-2 h-5 w-5 shrink-0 text-gray-500 transition-transform dark:text-gray-400 ${
                open ? "rotate-180" : ""
              }`}
            />
          </DisclosureButton>

          <DisclosurePanel className="border-t border-gray-300 px-4 py-4 dark:border-gray-700">
            {course.lessonStats && course.lessonStats.total > 0 && (
              <ProgressBar completed={course.lessonStats.completed} total={course.lessonStats.total} />
            )}

            <div className="mt-0">
              <p className="mb-2 text-theme-xs font-medium text-gray-500 dark:text-gray-400">快速指令</p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/school/courses/${course.id}`}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-theme-xs font-medium text-gray-700 transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 active:bg-brand-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-brand-500 dark:hover:bg-brand-900/20 dark:hover:text-brand-400"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>查看詳情</span>
                </Link>
                <QuickActionButton action={{ label: "新增課堂", icon: <CalenderIcon className="h-4 w-4" /> }} />
                <QuickActionButton action={{ label: "新增導師", icon: <UserIcon className="h-4 w-4" /> }} />
                <QuickActionButton action={{ label: "新增發票", icon: <PageIcon className="h-4 w-4" /> }} />
                <QuickActionButton action={{ label: "修改資料", icon: <PencilIcon className="h-4 w-4" /> }} />
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="mb-2 text-theme-xs font-medium text-gray-500 dark:text-gray-400">課程資料</p>
                {course.courseCode && (
                  <InfoRow label="課程編號" value={course.courseCode} />
                )}
                <InfoRow label="所需導師" value={`${course.requiredTutors} 人`} />
                {course.lessonStats && (
                  <>
                    <InfoRow label="已排程課堂" value={`${course.lessonStats.scheduled} 堂`} />
                    {course.lessonStats.cancelled > 0 && (
                      <InfoRow label="已取消課堂" value={`${course.lessonStats.cancelled} 堂`} />
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2">
                <p className="mb-2 text-theme-xs font-medium text-gray-500 dark:text-gray-400">收費設定</p>
                {course.chargingModels?.includes("STUDENT_PER_LESSON") && (
                  <FeeCard model="STUDENT_PER_LESSON" amount={course.studentPerLessonFee} />
                )}
                {course.chargingModels?.includes("TUTOR_PER_LESSON") && (
                  <FeeCard model="TUTOR_PER_LESSON" amount={course.tutorPerLessonFee} />
                )}
                {course.chargingModels?.includes("STUDENT_HOURLY") && (
                  <FeeCard model="STUDENT_HOURLY" amount={course.studentHourlyFee} />
                )}
                {course.chargingModels?.includes("TUTOR_HOURLY") && (
                  <FeeCard model="TUTOR_HOURLY" amount={course.tutorHourlyFee} />
                )}
                {course.chargingModels?.includes("STUDENT_FULL_COURSE") && (
                  <FeeCard model="STUDENT_FULL_COURSE" amount={course.studentFullCourseFee} />
                )}
                {course.chargingModels?.includes("TEAM_ACTIVITY") && (
                  <FeeCard model="TEAM_ACTIVITY" amount={course.teamActivityFee} />
                )}
              </div>
            </div>

            {course.description && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <p className="text-theme-xs font-medium text-gray-500 dark:text-gray-400 mb-1">課程描述</p>
                <p className="text-theme-sm text-gray-800 dark:text-gray-300">
                  {course.description}
                </p>
              </div>
            )}
          </DisclosurePanel>
        </div>
      )}
    </Disclosure>
  );
}

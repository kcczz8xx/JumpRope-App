"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { ChevronDownIcon, EyeIcon, CalenderIcon, UserIcon, PageIcon, PencilIcon } from "@/icons";
import ComponentCard from "@/components/tailadmin/common/ComponentCard";
import { Modal } from "@/components/tailadmin/ui/modal";
import Button from "@/components/tailadmin/ui/button/Button";
import { useModal } from "@/hooks/useModal";
import CoursesFormStep from "@/components/feature/school-service/course/CoursesFormStep";
import { CourseItemData, getDefaultCourseItem } from "@/components/feature/school-service/types/course";

interface LessonStats {
  total: number;
  completed: number;
  scheduled: number;
  cancelled: number;
}

interface CourseData {
  id: string;
  courseName: string;
  courseCode?: string | null;
  courseType: string;
  description?: string | null;
  courseTerm: string;
  academicYear: string;
  startDate?: Date | null;
  endDate?: Date | null;
  requiredTutors: number;
  maxStudents?: number | null;
  chargingModels: string[];
  studentPerLessonFee?: number | null;
  studentHourlyFee?: number | null;
  studentFullCourseFee?: number | null;
  teamActivityFee?: number | null;
  tutorPerLessonFee?: number | null;
  tutorHourlyFee?: number | null;
  status: string;
  _count?: {
    lessons: number;
  };
  lessonStats?: LessonStats;
}

interface CourseCardsProps {
  courses: CourseData[];
  selectedYear: string;
}

const courseTermMap: Record<string, string> = {
  FULL_YEAR: "全期",
  FIRST_TERM: "上學期",
  SECOND_TERM: "下學期",
  SUMMER: "暑期",
};

const courseStatusMap: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "草稿", color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" },
  SCHEDULED: { label: "已排程", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  ACTIVE: { label: "進行中", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300" },
  COMPLETED: { label: "已完成", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  CANCELLED: { label: "已取消", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
  SUSPENDED: { label: "已暫停", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
};

const chargingModelMap: Record<string, { label: string; desc: string }> = {
  STUDENT_PER_LESSON: { label: "學生每堂", desc: "按學生人數 × 課堂數收費" },
  TUTOR_PER_LESSON: { label: "導師每堂", desc: "按導師課堂數收費" },
  STUDENT_HOURLY: { label: "學生時薪", desc: "按學生人數 × 小時數收費" },
  TUTOR_HOURLY: { label: "導師時薪", desc: "按導師工作時數收費" },
  STUDENT_FULL_COURSE: { label: "學生全期", desc: "學生一次性繳付全期費用" },
  TEAM_ACTIVITY: { label: "帶隊活動", desc: "整個活動收費" },
};

const formatDate = (date: Date | null | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("zh-HK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat("zh-HK", {
    style: "currency",
    currency: "HKD",
    minimumFractionDigits: 0,
  }).format(amount);
};

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between py-1">
    <span className="text-theme-sm text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-theme-sm font-medium text-gray-800 dark:text-white text-right">
      {value}
    </span>
  </div>
);

const ProgressBar = ({ completed, total }: { completed: number; total: number }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-theme-xs text-gray-500 dark:text-gray-400 mb-1">
        <span>課堂進度</span>
        <span>{completed}/{total} 堂 ({percentage}%)</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-1.5 rounded-full bg-brand-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

const QuickActionButton = ({ action }: { action: QuickAction }) => (
  <button
    type="button"
    onClick={action.onClick}
    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-theme-xs font-medium text-gray-700 transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 active:bg-brand-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-brand-500 dark:hover:bg-brand-900/20 dark:hover:text-brand-400"
  >
    {action.icon}
    <span>{action.label}</span>
  </button>
);

const FeeCard = ({ model, amount }: { model: string; amount: number | null | undefined }) => {
  const modelInfo = chargingModelMap[model];
  if (!modelInfo || amount === null || amount === undefined) return null;
  
  return (
    <div className="rounded-lg border border-brand-100 bg-brand-25 p-3 dark:border-brand-800 dark:bg-brand-950/30">
      <div className="flex items-center justify-between">
        <span className="text-theme-sm font-medium text-gray-800 dark:text-white">
          {modelInfo.label}
        </span>
        <span className="text-theme-sm font-semibold text-brand-600 dark:text-brand-400">
          {formatCurrency(amount)}
        </span>
      </div>
      <p className="mt-1 text-theme-xs text-gray-500 dark:text-gray-400">
        {modelInfo.desc}
      </p>
    </div>
  );
};

export const CourseCards: React.FC<CourseCardsProps> = ({ courses, selectedYear }) => {
  const filteredCourses = courses.filter((c) => c.academicYear === selectedYear);
  const { isOpen, openModal, closeModal } = useModal();
  const [newCourses, setNewCourses] = useState<CourseItemData[]>([getDefaultCourseItem()]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleSaveCourse = () => {
    closeModal();
    setNewCourses([getDefaultCourseItem()]);
    setFormErrors({});
  };

  const renderAddCourseButton = () => (
    <Button size="sm" onClick={openModal}>
      + 新增課堂
    </Button>
  );

  if (filteredCourses.length === 0) {
    return (
      <>
        <ComponentCard title="課程資料" headerAction={renderAddCourseButton()}>
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            此學年暫無課程資料
          </div>
        </ComponentCard>

        <Modal isOpen={isOpen} onClose={closeModal} className="max-w-4xl p-6">
          <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white">
            新增課堂
          </h4>
          <div className="max-h-[70vh] overflow-y-auto">
            <CoursesFormStep
              courses={newCourses}
              onCoursesChange={setNewCourses}
              errors={formErrors}
            />
          </div>
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
            <Button size="sm" variant="outline" onClick={closeModal}>
              取消
            </Button>
            <Button size="sm" onClick={handleSaveCourse}>
              儲存課堂
            </Button>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <>
      <ComponentCard
        title="課程資料"
        desc={`${filteredCourses.length} 個課程`}
        headerAction={renderAddCourseButton()}
      >
        <div className="space-y-3">
          {filteredCourses.map((course) => {
            const statusInfo = courseStatusMap[course.status] || {
              label: course.status,
              color: "bg-gray-100 text-gray-800",
            };

            return (
              <Disclosure key={course.id}>
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
                          <span>{courseTermMap[course.courseTerm] || course.courseTerm}</span>
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
          })}
        </div>
      </ComponentCard>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-4xl p-6">
        <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white">
          新增課堂
        </h4>
        <div className="max-h-[70vh] overflow-y-auto">
          <CoursesFormStep
            courses={newCourses}
            onCoursesChange={setNewCourses}
            errors={formErrors}
          />
        </div>
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button size="sm" variant="outline" onClick={closeModal}>
            取消
          </Button>
          <Button size="sm" onClick={handleSaveCourse}>
            儲存課堂
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default CourseCards;

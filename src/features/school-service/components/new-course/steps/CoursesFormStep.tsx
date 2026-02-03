"use client";

import React from "react";
import FormCard from "@/components/tailadmin/form/FormCard";
import { CourseItemCard } from "../cards";
import { CourseItemData, getDefaultCourseItem } from "../../types";

interface CoursesFormStepProps {
  courses: CourseItemData[];
  onCoursesChange: (courses: CourseItemData[]) => void;
  errors: Record<string, string>;
}

export default function CoursesFormStep({
  courses,
  onCoursesChange,
  errors,
}: CoursesFormStepProps) {
  const handleAddCourse = () => {
    onCoursesChange([...courses, getDefaultCourseItem()]);
  };

  const handleRemoveCourse = (id: string) => {
    if (courses.length > 1) {
      onCoursesChange(courses.filter((c) => c.id !== id));
    }
  };

  const handleUpdateCourse = (id: string, updates: Partial<CourseItemData>) => {
    onCoursesChange(
      courses.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const fillMockData = async () => {
    if (courses.length > 0) {
      const { formFixtures } = await import(
        "@/lib/mock-data/school-service/client"
      );
      handleUpdateCourse(courses[0].id, formFixtures.course());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={fillMockData}
          className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          🧪 填充測試數據
        </button>
      </div>

      <FormCard
        title="步驟 2：課程資料"
        description="新增當前學校的課程，可新增多個課程"
      >
        <div className="space-y-6">
          {courses.map((course, index) => (
            <CourseItemCard
              key={course.id}
              course={course}
              index={index}
              errors={errors}
              onUpdateCourse={handleUpdateCourse}
              onRemoveCourse={handleRemoveCourse}
              canRemove={courses.length > 1}
            />
          ))}

          <button
            type="button"
            onClick={handleAddCourse}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-4 text-gray-500 hover:border-brand-500 hover:text-brand-500 dark:border-gray-600 dark:hover:border-brand-400"
          >
            + 新增課程
          </button>
        </div>
      </FormCard>
    </div>
  );
}

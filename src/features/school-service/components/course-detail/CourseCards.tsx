"use client";

import React, { useState } from "react";
import ComponentCard from "@/components/tailadmin/common/ComponentCard";
import Button from "@/components/tailadmin/ui/button/Button";
import { useModal } from "@/hooks/useModal";
import { CourseItemData, getDefaultCourseItem } from "../types";
import { CourseCardsProps } from "./types";
import CourseCardItem from "./CourseCardItem";
import AddCourseModal from "./AddCourseModal";

export default function CourseCards({
  courses,
  selectedYear,
}: CourseCardsProps) {
  const filteredCourses = courses.filter(
    (c) => c.academicYear === selectedYear
  );
  const { isOpen, openModal, closeModal } = useModal();
  const [newCourses, setNewCourses] = useState<CourseItemData[]>([
    getDefaultCourseItem(),
  ]);
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

        <AddCourseModal
          isOpen={isOpen}
          onClose={closeModal}
          courses={newCourses}
          onCoursesChange={setNewCourses}
          errors={formErrors}
          onSave={handleSaveCourse}
        />
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
          {filteredCourses.map((course) => (
            <CourseCardItem key={course.id} course={course} />
          ))}
        </div>
      </ComponentCard>

      <AddCourseModal
        isOpen={isOpen}
        onClose={closeModal}
        courses={newCourses}
        onCoursesChange={setNewCourses}
        errors={formErrors}
        onSave={handleSaveCourse}
      />
    </>
  );
}

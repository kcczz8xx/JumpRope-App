"use client";

import React from "react";
import { Modal } from "@/components/tailadmin/ui/modal";
import Button from "@/components/tailadmin/ui/button/Button";
import { CoursesFormStep } from "../new-course";
import { CourseItemData } from "../types";

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: CourseItemData[];
  onCoursesChange: (courses: CourseItemData[]) => void;
  errors: Record<string, string>;
  onSave: () => void;
}

export default function AddCourseModal({
  isOpen,
  onClose,
  courses,
  onCoursesChange,
  errors,
  onSave,
}: AddCourseModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl p-6">
      <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white">
        新增課堂
      </h4>
      <div className="max-h-[70vh] overflow-y-auto">
        <CoursesFormStep
          courses={courses}
          onCoursesChange={onCoursesChange}
          errors={errors}
        />
      </div>
      <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
        <Button size="sm" variant="outline" onClick={onClose}>
          取消
        </Button>
        <Button size="sm" onClick={onSave}>
          儲存課堂
        </Button>
      </div>
    </Modal>
  );
}

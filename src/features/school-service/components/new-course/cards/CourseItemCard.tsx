"use client";

import SearchableSelect from "@/components/tailadmin/form/select/SearchableSelect";
import MultiSelect from "@/components/tailadmin/form/select/MultiSelect";
import Input from "@/components/tailadmin/form/input/InputField";
import TextArea from "@/components/tailadmin/form/input/TextArea";
import { FormField } from "../../common";
import { ChargingFieldsRenderer } from "./";
import {
  CourseItemData,
  CourseTerm,
  ChargingModel,
  DEFAULT_COURSE_TYPES,
  COURSE_TERM_LABELS,
  CHARGING_MODEL_LABELS,
} from "../../types";

interface CourseItemCardProps {
  course: CourseItemData;
  index: number;
  errors: Record<string, string>;
  onUpdateCourse: (id: string, updates: Partial<CourseItemData>) => void;
  onRemoveCourse: (id: string) => void;
  canRemove: boolean;
}

export default function CourseItemCard({
  course,
  index,
  errors,
  onUpdateCourse,
  onRemoveCourse,
  canRemove,
}: CourseItemCardProps) {
  const courseTypeOptions = DEFAULT_COURSE_TYPES.map((type) => ({
    value: type,
    label: type,
  }));

  const courseTermOptions = Object.entries(COURSE_TERM_LABELS).map(
    ([value, label]) => ({
      value,
      label,
    })
  );

  const chargingModelOptions = Object.entries(CHARGING_MODEL_LABELS).map(
    ([value, label]) => ({
      value,
      label,
    })
  );

  return (
    <div className="relative rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium text-gray-800 dark:text-white">
          課程 {index + 1}
        </h3>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemoveCourse(course.id)}
            className="text-gray-400 hover:text-error-500"
            title="移除課程"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-4">
        <FormField
          label="課程名稱"
          required
          error={errors[`course_${index}_courseName`]}
        >
          <Input
            type="text"
            placeholder="例如：跳繩恆常班（上學期）"
            defaultValue={course.courseName}
            onChange={(e) =>
              onUpdateCourse(course.id, { courseName: e.target.value })
            }
            error={!!errors[`course_${index}_courseName`]}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            label="課程類型"
            required
            error={errors[`course_${index}_courseType`]}
          >
            <SearchableSelect
              options={courseTypeOptions}
              placeholder="選擇或輸入課程類型"
              defaultValue={course.courseType}
              allowCreate={true}
              onCreateOption={(inputValue) => inputValue}
              onChange={(value) =>
                onUpdateCourse(course.id, { courseType: value })
              }
            />
          </FormField>

          <FormField
            label="學期"
            required
            error={errors[`course_${index}_courseTerm`]}
          >
            <SearchableSelect
              options={courseTermOptions}
              placeholder="選擇學期"
              defaultValue={course.courseTerm}
              onChange={(value) =>
                onUpdateCourse(course.id, { courseTerm: value as CourseTerm })
              }
            />
          </FormField>

          <FormField
            label="所需導師"
            required
            error={errors[`course_${index}_requiredTutors`]}
          >
            <Input
              type="number"
              placeholder="1"
              defaultValue={course.requiredTutors}
              min="1"
              onChange={(e) =>
                onUpdateCourse(course.id, {
                  requiredTutors: parseInt(e.target.value) || 1,
                })
              }
              error={!!errors[`course_${index}_requiredTutors`]}
            />
          </FormField>
        </div>

        <FormField
          label="收費模式"
          required
          error={errors[`course_${index}_chargingModel`]}
          hint="可選擇多個收費模式"
        >
          <MultiSelect
            key={`${course.id}-${course.chargingModel.join(",")}`}
            label=""
            options={chargingModelOptions.map((opt) => ({
              value: opt.value,
              text: opt.label,
              selected: course.chargingModel.includes(
                opt.value as ChargingModel
              ),
            }))}
            defaultSelected={course.chargingModel}
            onChange={(selected) =>
              onUpdateCourse(course.id, {
                chargingModel: selected as ChargingModel[],
              })
            }
          />
        </FormField>

        <ChargingFieldsRenderer
          course={course}
          index={index}
          errors={errors}
          onUpdateCourse={onUpdateCourse}
        />

        <FormField
          label="課程描述"
          error={errors[`course_${index}_courseDescription`]}
        >
          <TextArea
            placeholder="例如：適合小三至小五學生，教授基本跳繩技巧..."
            rows={3}
            value={course.courseDescription ?? ""}
            onChange={(value) =>
              onUpdateCourse(course.id, { courseDescription: value || null })
            }
          />
        </FormField>
      </div>
    </div>
  );
}

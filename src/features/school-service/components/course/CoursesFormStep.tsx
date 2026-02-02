"use client";

import React from "react";
import SearchableSelect from "@/components/tailadmin/form/select/SearchableSelect";
import MultiSelect from "@/components/tailadmin/form/select/MultiSelect";
import Input from "@/components/tailadmin/form/input/InputField";
import TextArea from "@/components/tailadmin/form/input/TextArea";
import FormField from "../common/FormField";
import FormCard from "@/components/tailadmin/form/FormCard";
import AmountInput from "../common/AmountInput";
import {
  CourseItemData,
  CourseTerm,
  ChargingModel,
  DEFAULT_COURSE_TYPES,
  COURSE_TERM_LABELS,
  CHARGING_MODEL_LABELS,
  getDefaultCourseItem,
} from "../types/course";

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
      const { formFixtures } = await import('@/lib/mock-data/school-service/client');
      handleUpdateCourse(courses[0].id, formFixtures.course());
    }
  };

  const renderChargingFields = (course: CourseItemData, index: number) => {
    const errorKey = `course_${index}_`;
    const fields = [];

    if (course.chargingModel.includes(ChargingModel.STUDENT_PER_LESSON)) {
      fields.push(
        <FormField
          key="studentPerLessonFee"
          label="每堂每位學生收費"
          required
          error={errors[`${errorKey}studentPerLessonFee`]}
          hint="學生人數 × 此金額 × 課堂數 = 總收入"
        >
          <AmountInput
            value={course.studentPerLessonFee}
            onChange={(value) =>
              handleUpdateCourse(course.id, { studentPerLessonFee: value })
            }
            placeholder="50"
            error={!!errors[`${errorKey}studentPerLessonFee`]}
          />
        </FormField>
      );
    }

    if (course.chargingModel.includes(ChargingModel.TUTOR_PER_LESSON)) {
      fields.push(
        <FormField
          key="tutorPerLessonFee"
          label="每堂導師收費"
          required
          error={errors[`${errorKey}tutorPerLessonFee`]}
          hint="此金額 × 課堂數 = 總收入"
        >
          <AmountInput
            value={course.tutorPerLessonFee}
            onChange={(value) =>
              handleUpdateCourse(course.id, { tutorPerLessonFee: value })
            }
            placeholder="800"
            error={!!errors[`${errorKey}tutorPerLessonFee`]}
          />
        </FormField>
      );
    }

    if (course.chargingModel.includes(ChargingModel.STUDENT_HOURLY)) {
      fields.push(
        <FormField
          key="studentHourlyFee"
          label="每小時每位學生收費"
          required
          error={errors[`${errorKey}studentHourlyFee`]}
          hint="學生人數 × 此金額 × 小時數 = 總收入"
        >
          <AmountInput
            value={course.studentHourlyFee}
            onChange={(value) =>
              handleUpdateCourse(course.id, { studentHourlyFee: value })
            }
            placeholder="100"
            error={!!errors[`${errorKey}studentHourlyFee`]}
          />
        </FormField>
      );
    }

    if (course.chargingModel.includes(ChargingModel.TUTOR_HOURLY)) {
      fields.push(
        <FormField
          key="tutorHourlyFee"
          label="導師時薪收費"
          required
          error={errors[`${errorKey}tutorHourlyFee`]}
          hint="此金額 × 小時數 = 總收入"
        >
          <AmountInput
            value={course.tutorHourlyFee}
            onChange={(value) =>
              handleUpdateCourse(course.id, { tutorHourlyFee: value })
            }
            placeholder="300"
            error={!!errors[`${errorKey}tutorHourlyFee`]}
          />
        </FormField>
      );
    }

    if (course.chargingModel.includes(ChargingModel.STUDENT_FULL_COURSE)) {
      fields.push(
        <FormField
          key="studentFullCourseFee"
          label="學生全期課程收費"
          required
          error={errors[`${errorKey}studentFullCourseFee`]}
          hint="學生人數 × 此金額 = 總收入"
        >
          <AmountInput
            value={course.studentFullCourseFee}
            onChange={(value) =>
              handleUpdateCourse(course.id, { studentFullCourseFee: value })
            }
            placeholder="2000"
            error={!!errors[`${errorKey}studentFullCourseFee`]}
          />
        </FormField>
      );
    }

    if (course.chargingModel.includes(ChargingModel.TEAM_ACTIVITY)) {
      fields.push(
        <FormField
          key="teamActivityFee"
          label="帶隊活動收費"
          required
          error={errors[`${errorKey}teamActivityFee`]}
          hint="整個活動的收費"
        >
          <AmountInput
            value={course.teamActivityFee}
            onChange={(value) =>
              handleUpdateCourse(course.id, { teamActivityFee: value })
            }
            placeholder="5000"
            error={!!errors[`${errorKey}teamActivityFee`]}
          />
        </FormField>
      );
    }

    return <>{fields}</>;
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
            <div
              key={course.id}
              className="relative rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium text-gray-800 dark:text-white">
                  課程 {index + 1}
                </h3>
                {courses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCourse(course.id)}
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
                      handleUpdateCourse(course.id, {
                        courseName: e.target.value,
                      })
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
                      onCreateOption={(inputValue) => {
                        return inputValue; // 直接返回輸入的值作為新選項的值
                      }}
                      onChange={(value) =>
                        handleUpdateCourse(course.id, {
                          courseType: value,
                        })
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
                        handleUpdateCourse(course.id, {
                          courseTerm: value as CourseTerm,
                        })
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
                        handleUpdateCourse(course.id, {
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
                    key={`${course.id}-${course.chargingModel.join(',')}`}
                    label=""
                    options={chargingModelOptions.map((opt) => ({
                      value: opt.value,
                      text: opt.label,
                      selected: course.chargingModel.includes(opt.value as ChargingModel),
                    }))}
                    defaultSelected={course.chargingModel}
                    onChange={(selected) =>
                      handleUpdateCourse(course.id, {
                        chargingModel: selected as ChargingModel[],
                      })
                    }
                  />
                </FormField>

                {renderChargingFields(course, index)}

                <FormField
                  label="課程描述"
                  error={errors[`course_${index}_courseDescription`]}
                >
                  <TextArea
                    placeholder="例如：適合小三至小五學生，教授基本跳繩技巧..."
                    rows={3}
                    value={course.courseDescription ?? ""}
                    onChange={(value) =>
                      handleUpdateCourse(course.id, {
                        courseDescription: value || null,
                      })
                    }
                  />
                </FormField>
              </div>
            </div>
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

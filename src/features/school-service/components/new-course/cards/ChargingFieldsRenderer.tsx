"use client";

import { FormField, AmountInput } from "../../common";
import { CourseItemData, ChargingModel } from "../../types";

interface ChargingFieldsRendererProps {
  course: CourseItemData;
  index: number;
  errors: Record<string, string>;
  onUpdateCourse: (id: string, updates: Partial<CourseItemData>) => void;
}

export default function ChargingFieldsRenderer({
  course,
  index,
  errors,
  onUpdateCourse,
}: ChargingFieldsRendererProps) {
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
            onUpdateCourse(course.id, { studentPerLessonFee: value })
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
            onUpdateCourse(course.id, { tutorPerLessonFee: value })
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
            onUpdateCourse(course.id, { studentHourlyFee: value })
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
            onUpdateCourse(course.id, { tutorHourlyFee: value })
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
            onUpdateCourse(course.id, { studentFullCourseFee: value })
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
            onUpdateCourse(course.id, { teamActivityFee: value })
          }
          placeholder="5000"
          error={!!errors[`${errorKey}teamActivityFee`]}
        />
      </FormField>
    );
  }

  return <>{fields}</>;
}

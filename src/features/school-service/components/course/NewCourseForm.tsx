"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/tailadmin/ui/button/Button";
import StepIndicator from "@/components/tailadmin/form/StepIndicator";
import SchoolFormStep from "./SchoolFormStep";
import CoursesFormStep from "./CoursesFormStep";
import SummaryFormStep from "./SummaryFormStep";
import {
  NewCourseFormData,
  SchoolBasicData,
  SchoolContactData,
  CourseItemData,
  ChargingModel,
  getDefaultNewCourseFormData,
  calculateAcademicYear,
} from "../types/course";

interface School {
  id: string;
  schoolName: string;
}

interface NewCourseFormProps {
  schools: School[];
  isLoadingSchools?: boolean;
  quotationId?: string;
}

const STEPS = [
  { label: "學校資料" },
  { label: "課程資料" },
  { label: "總結" },
];

export default function NewCourseForm({
  schools,
  isLoadingSchools = false,
  quotationId,
}: NewCourseFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<NewCourseFormData>(
    getDefaultNewCourseFormData()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSchoolChange = useCallback((updates: Partial<SchoolBasicData>) => {
    setFormData((prev) => {
      const updatedSchool = { ...prev.school, ...updates };
      
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        Object.keys(updates).forEach((key) => {
          delete newErrors[key];
        });
        
        if (
          updatedSchool.partnershipEndDate &&
          updatedSchool.partnershipStartDate &&
          updatedSchool.partnershipEndDate < updatedSchool.partnershipStartDate
        ) {
          newErrors.partnershipEndDate = "結束日期不能早於開始日期";
        }
        
        return newErrors;
      });
      
      return {
        ...prev,
        school: updatedSchool,
      };
    });
  }, []);

  const handleContactChange = useCallback((updates: Partial<SchoolContactData>) => {
    setFormData((prev) => ({
      ...prev,
      contact: { ...prev.contact, ...updates },
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(updates).forEach((key) => {
        delete newErrors[`contact${key.charAt(0).toUpperCase() + key.slice(1)}`];
      });
      return newErrors;
    });
  }, []);

  const handleCoursesChange = useCallback((courses: CourseItemData[]) => {
    setFormData((prev) => ({ ...prev, courses }));
  }, []);

  const validateStep1 = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const { school, contact } = formData;

    if (!school.schoolName.trim()) {
      newErrors.schoolName = "請輸入學校名稱";
    }
    if (!school.address.trim()) {
      newErrors.address = "請輸入學校地址";
    }
    if (!school.partnershipStartDate) {
      newErrors.partnershipStartDate = "請選擇合作開始日期";
    }
    if (
      school.partnershipEndDate &&
      school.partnershipStartDate &&
      school.partnershipEndDate < school.partnershipStartDate
    ) {
      newErrors.partnershipEndDate = "結束日期不能早於開始日期";
    }
    if (!school.confirmationChannel.trim()) {
      newErrors.confirmationChannel = "請輸入確認渠道";
    }

    if (!contact.nameChinese.trim()) {
      newErrors.contactNameChinese = "請輸入聯絡人姓名";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const validateStep2 = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const { courses } = formData;

    if (courses.length === 0) {
      newErrors.courses = "請至少新增一個課程";
      setErrors(newErrors);
      return false;
    }

    courses.forEach((course, index) => {
      const prefix = `course_${index}_`;

      if (!course.courseName.trim()) {
        newErrors[`${prefix}courseName`] = "請輸入課程名稱";
      }
      if (!course.courseType || !course.courseType.trim()) {
        newErrors[`${prefix}courseType`] = "請選擇課程類型";
      }
      if (!course.chargingModel || course.chargingModel.length === 0) {
        newErrors[`${prefix}chargingModel`] = "請選擇至少一個收費模式";
      }
      
      if (
        course.endDate &&
        course.startDate &&
        course.endDate < course.startDate
      ) {
        newErrors[`${prefix}endDate`] = "結束日期不能早於開始日期";
      }
      if (!course.requiredTutors || course.requiredTutors < 1) {
        newErrors[`${prefix}requiredTutors`] = "至少需要 1 位導師";
      }

      course.chargingModel.forEach((model) => {
        switch (model) {
          case ChargingModel.STUDENT_PER_LESSON:
            if (!course.studentPerLessonFee || course.studentPerLessonFee <= 0) {
              newErrors[`${prefix}studentPerLessonFee`] = "請輸入有效的收費金額";
            }
            break;
          case ChargingModel.TUTOR_PER_LESSON:
            if (!course.tutorPerLessonFee || course.tutorPerLessonFee <= 0) {
              newErrors[`${prefix}tutorPerLessonFee`] = "請輸入有效的收費金額";
            }
            break;
          case ChargingModel.STUDENT_HOURLY:
            if (!course.studentHourlyFee || course.studentHourlyFee <= 0) {
              newErrors[`${prefix}studentHourlyFee`] = "請輸入有效的收費金額";
            }
            break;
          case ChargingModel.TUTOR_HOURLY:
            if (!course.tutorHourlyFee || course.tutorHourlyFee <= 0) {
              newErrors[`${prefix}tutorHourlyFee`] = "請輸入有效的收費金額";
            }
            break;
          case ChargingModel.STUDENT_FULL_COURSE:
            if (!course.studentFullCourseFee || course.studentFullCourseFee <= 0) {
              newErrors[`${prefix}studentFullCourseFee`] = "請輸入有效的收費金額";
            }
            break;
          case ChargingModel.TEAM_ACTIVITY:
            if (!course.teamActivityFee || course.teamActivityFee <= 0) {
              newErrors[`${prefix}teamActivityFee`] = "請輸入有效的收費金額";
            }
            break;
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = useCallback(() => {
    let isValid = false;

    if (currentStep === 0) {
      isValid = validateStep1();
    } else if (currentStep === 1) {
      isValid = validateStep2();
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  }, [currentStep, validateStep1, validateStep2]);

  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleStepClick = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const { school, contact, academicYear, courses } = formData;
      
      const academicYearCalculated = calculateAcademicYear(
        school.partnershipStartDate,
        school.partnershipEndDate
      );

      const response = await fetch("/api/school-service/courses/batch-with-school", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          school: {
            ...school,
            partnershipStartYear: academicYearCalculated,
          },
          contact,
          academicYear,
          courses: courses.map((course) => ({
            ...course,
            academicYear,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "建立失敗");
      }

      const result = await response.json();
      router.push(`/dashboard/school/courses?schoolId=${result.schoolId}`);
    } catch (error) {
      console.error("Failed to create:", error);
      setErrors({
        submit:
          error instanceof Error ? error.message : "建立失敗，請稍後再試",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, router]);

  const handleCancel = useCallback(() => {
    router.push("/dashboard/school/courses");
  }, [router]);


  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <SchoolFormStep
            schoolData={formData.school}
            contactData={formData.contact}
            onSchoolChange={handleSchoolChange}
            onContactChange={handleContactChange}
            errors={errors}
            schools={schools}
            isLoadingSchools={isLoadingSchools}
            quotationId={quotationId}
          />
        );
      case 1:
        return (
          <CoursesFormStep
            courses={formData.courses}
            onCoursesChange={handleCoursesChange}
            errors={errors}
          />
        );
      case 2:
        return <SummaryFormStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <>
      <StepIndicator
        steps={STEPS}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      <div className="space-y-6">
        {renderStep()}

        {errors.submit && (
          <div className="rounded-lg bg-error-50 p-4 text-sm text-error-600 dark:bg-error-900/20 dark:text-error-400">
            {errors.submit}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? handleCancel : handlePrev}
          >
            {currentStep === 0 ? "取消" : "← 上一步"}
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext}>下一步 →</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "建立中..." : "確認建立課程"}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

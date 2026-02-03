"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/tailadmin/ui/button/Button";
import { FormError } from "@/components/shared/forms";
import StepIndicator from "@/components/tailadmin/form/StepIndicator";
import { SchoolFormStep, CoursesFormStep, SummaryFormStep } from "./steps";
import { useNewCourseFormValidation } from "./hooks";
import {
  NewCourseFormData,
  SchoolBasicData,
  SchoolContactData,
  CourseItemData,
  getDefaultNewCourseFormData,
  calculateAcademicYear,
} from "../types";

interface School {
  id: string;
  schoolName: string;
}

type BatchCreateAction = (input: {
  school: SchoolBasicData & { partnershipStartYear?: string };
  contact: SchoolContactData;
  academicYear: string;
  courses: (CourseItemData & { academicYear: string })[];
}) => Promise<
  | { success: true; data: { schoolId: string } }
  | { success: false; error: { message?: string } }
>;

type GetSchoolByIdAction = (input: { id: string }) => Promise<
  | {
      success: true;
      data: {
        schoolName: string;
        schoolNameEn: string | null;
        address: string | null;
        phone: string | null;
        email: string | null;
        website: string | null;
      };
    }
  | { success: false; error: { message?: string } }
>;

interface NewCourseFormProps {
  schools: School[];
  isLoadingSchools?: boolean;
  quotationId?: string;
  batchCreateAction: BatchCreateAction;
  getSchoolByIdAction: GetSchoolByIdAction;
}

const STEPS = [{ label: "學校資料" }, { label: "課程資料" }, { label: "總結" }];

export default function NewCourseForm({
  schools,
  isLoadingSchools = false,
  quotationId,
  batchCreateAction,
  getSchoolByIdAction,
}: NewCourseFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<NewCourseFormData>(
    getDefaultNewCourseFormData()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSchoolChange = useCallback(
    (updates: Partial<SchoolBasicData>) => {
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
            updatedSchool.partnershipEndDate <
              updatedSchool.partnershipStartDate
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
    },
    []
  );

  const handleContactChange = useCallback(
    (updates: Partial<SchoolContactData>) => {
      setFormData((prev) => ({
        ...prev,
        contact: { ...prev.contact, ...updates },
      }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(updates).forEach((key) => {
          delete newErrors[
            `contact${key.charAt(0).toUpperCase() + key.slice(1)}`
          ];
        });
        return newErrors;
      });
    },
    []
  );

  const handleCoursesChange = useCallback((courses: CourseItemData[]) => {
    setFormData((prev) => ({ ...prev, courses }));
  }, []);

  const { validateStep1, validateStep2 } = useNewCourseFormValidation(
    formData,
    setErrors
  );

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

      const result = await batchCreateAction({
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
      });

      if (!result.success) {
        throw new Error(result.error.message || "建立失敗");
      }

      router.push(`/dashboard/school/courses?schoolId=${result.data.schoolId}`);
    } catch (error) {
      console.error("Failed to create:", error);
      setErrors({
        submit: error instanceof Error ? error.message : "建立失敗，請稍後再試",
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
            getSchoolByIdAction={getSchoolByIdAction}
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

        <FormError message={errors.submit} />

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

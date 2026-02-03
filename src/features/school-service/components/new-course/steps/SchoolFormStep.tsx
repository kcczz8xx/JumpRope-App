"use client";

import React, { useEffect, useTransition } from "react";
import {
  SchoolBasicData,
  SchoolContactData,
  calculateAcademicYear,
} from "../../types";
import {
  SchoolBasicInfoCard,
  PartnershipInfoCard,
  ContactInfoCard,
} from "../cards";

interface School {
  id: string;
  schoolName: string;
}

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

interface SchoolFormStepProps {
  schoolData: SchoolBasicData;
  contactData: SchoolContactData;
  onSchoolChange: (data: Partial<SchoolBasicData>) => void;
  onContactChange: (data: Partial<SchoolContactData>) => void;
  errors: Record<string, string>;
  schools: School[];
  isLoadingSchools?: boolean;
  quotationId?: string;
  getSchoolByIdAction: GetSchoolByIdAction;
}

export default function SchoolFormStep({
  schoolData,
  contactData,
  onSchoolChange,
  onContactChange,
  errors,
  schools,
  isLoadingSchools = false,
  quotationId,
  getSchoolByIdAction,
}: SchoolFormStepProps) {
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (schoolData.partnershipStartDate && schoolData.partnershipEndDate) {
      const academicYear = calculateAcademicYear(
        schoolData.partnershipStartDate,
        schoolData.partnershipEndDate
      );
      if (academicYear) {
        onSchoolChange({ partnershipStartYear: academicYear });
      }
    }
  }, [schoolData.partnershipStartDate, schoolData.partnershipEndDate]);

  const handleSchoolSelect = (selectedSchoolId: string) => {
    if (!selectedSchoolId) {
      onSchoolChange({
        schoolId: undefined,
        schoolName: "",
        schoolNameEn: "",
        address: "",
        phone: "",
        email: "",
        website: "",
      });
      return;
    }

    startTransition(async () => {
      const result = await getSchoolByIdAction({ id: selectedSchoolId });

      if (!result.success) {
        console.error("Failed to load school data:", result.error.message);
        return;
      }

      const school = result.data;
      onSchoolChange({
        schoolId: undefined,
        schoolName: school.schoolName || "",
        schoolNameEn: school.schoolNameEn || "",
        address: school.address || "",
        phone: school.phone || "",
        email: school.email || "",
        website: school.website || "",
      });
    });
  };

  const fillMockData = async () => {
    const { formFixtures } = await import(
      "@/lib/mock-data/school-service/client"
    );
    onSchoolChange(formFixtures.school());
    onContactChange(formFixtures.contact());
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

      <SchoolBasicInfoCard
        schoolData={schoolData}
        onSchoolChange={onSchoolChange}
        errors={errors}
        schools={schools}
        isLoadingSchools={isLoadingSchools}
        quotationId={quotationId}
        onSchoolSelect={handleSchoolSelect}
      />

      <PartnershipInfoCard
        schoolData={schoolData}
        onSchoolChange={onSchoolChange}
        errors={errors}
      />

      <ContactInfoCard
        contactData={contactData}
        onContactChange={onContactChange}
        errors={errors}
      />
    </div>
  );
}

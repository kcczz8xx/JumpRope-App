"use client";

import React, { useEffect, useTransition } from "react";
import SearchableSelect from "@/components/tailadmin/form/select/SearchableSelect";
import { getSchoolById } from "../../queries";
import Input from "@/components/tailadmin/form/input/InputField";
import TextArea from "@/components/tailadmin/form/input/TextArea";
import DatePicker from "@/components/tailadmin/form/date-picker";
import PhoneInput from "@/components/tailadmin/form/group-input/PhoneInput";
import FormField from "../common/FormField";
import FormCard from "@/components/tailadmin/form/FormCard";
import {
  SchoolBasicData,
  SchoolContactData,
  calculateAcademicYear,
} from "../types/course";

interface School {
  id: string;
  schoolName: string;
}

interface SchoolFormStepProps {
  schoolData: SchoolBasicData;
  contactData: SchoolContactData;
  onSchoolChange: (data: Partial<SchoolBasicData>) => void;
  onContactChange: (data: Partial<SchoolContactData>) => void;
  errors: Record<string, string>;
  schools: School[];
  isLoadingSchools?: boolean;
  quotationId?: string;
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
}: SchoolFormStepProps) {
  const [isPending, startTransition] = useTransition();

  const schoolOptions = schools.map((school) => ({
    value: school.id,
    label: school.schoolName,
  }));

  const confirmationChannelOptions = [
    { value: "電話", label: "電話" },
    { value: "電郵", label: "電郵" },
    { value: "會議", label: "會議" },
    { value: "WhatsApp", label: "WhatsApp" },
    { value: "面談", label: "面談" },
  ];

  const positionOptions = [
    { value: "校長", label: "校長" },
    { value: "副校長", label: "副校長" },
    { value: "體育科主任", label: "體育科主任" },
    { value: "課外活動主任", label: "課外活動主任" },
    { value: "主任", label: "主任" },
    { value: "老師", label: "老師" },
    { value: "教練", label: "教練" },
    { value: "職員", label: "職員" },
  ];

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
      const result = await getSchoolById(selectedSchoolId);

      if (!result.success) {
        console.error("Failed to load school data:", result.error.message);
        return;
      }

      const school = result.data;

      // 只填入資料作為參考，不設置 schoolId
      // 後端會根據學校名稱和合作日期判斷是否使用現有學校
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

      <FormCard
        title="步驟 1：學校資料"
        description="填寫學校基本資料和聯絡人資料"
      >
        <div className="space-y-6">
          {quotationId && (
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                📋 從報價單 #{quotationId} 帶入資料
              </p>
            </div>
          )}

          <FormField label="學校資料庫" error={errors.schoolId}>
            {isLoadingSchools ? (
              <div className="h-11 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
            ) : (
              <SearchableSelect
                options={schoolOptions}
                placeholder="搜尋學校或留空新增學校..."
                defaultValue={schoolData.schoolId}
                onChange={handleSchoolSelect}
                className={errors.schoolId ? "border-error-500" : ""}
                allowClear={true}
              />
            )}
          </FormField>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              label="學校名稱（中文）"
              required
              error={errors.schoolName}
            >
              <Input
                key={`schoolName-${schoolData.schoolId || "new"}`}
                type="text"
                placeholder="例如：聖保羅小學"
                defaultValue={schoolData.schoolName}
                onChange={(e) => onSchoolChange({ schoolName: e.target.value })}
                error={!!errors.schoolName}
              />
            </FormField>

            <FormField label="學校名稱（英文）" error={errors.schoolNameEn}>
              <Input
                key={`schoolNameEn-${schoolData.schoolId || "new"}`}
                type="text"
                placeholder="St. Paul's Primary School"
                defaultValue={schoolData.schoolNameEn}
                onChange={(e) =>
                  onSchoolChange({ schoolNameEn: e.target.value })
                }
                error={!!errors.schoolNameEn}
              />
            </FormField>
          </div>

          <FormField label="學校地址" required error={errors.address}>
            <Input
              key={`address-${schoolData.schoolId || "new"}`}
              type="text"
              placeholder="香港九龍..."
              defaultValue={schoolData.address}
              onChange={(e) => onSchoolChange({ address: e.target.value })}
              error={!!errors.address}
            />
          </FormField>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="學校電話" error={errors.phone}>
              <PhoneInput
                key={`phone-${schoolData.schoolId || "new"}`}
                value={schoolData.phone}
                placeholder="2123 4567"
                onChange={(phone) => onSchoolChange({ phone })}
                error={!!errors.phone}
                showValidation={true}
                defaultCountry="hk"
              />
            </FormField>

            <FormField label="學校電郵" error={errors.email}>
              <Input
                key={`email-${schoolData.schoolId || "new"}`}
                type="email"
                placeholder="info@school.edu.hk"
                defaultValue={schoolData.email}
                onChange={(e) => onSchoolChange({ email: e.target.value })}
                error={!!errors.email}
              />
            </FormField>
          </div>

          <FormField label="學校網站" error={errors.website}>
            <Input
              key={`website-${schoolData.schoolId || "new"}`}
              type="url"
              placeholder="https://www.school.edu.hk"
              defaultValue={schoolData.website}
              onChange={(e) => onSchoolChange({ website: e.target.value })}
              error={!!errors.website}
            />
          </FormField>
        </div>
      </FormCard>

      <FormCard title="合作資料" description="填寫合作詳情及確認方式">
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              label="合作開始日期"
              required
              error={errors.partnershipStartDate}
            >
              <DatePicker
                id="partnershipStartDate"
                placeholder="選擇開始日期"
                defaultDate={schoolData.partnershipStartDate || undefined}
                onChange={(dates, dateStr) => {
                  if (dates.length > 0) {
                    onSchoolChange({ partnershipStartDate: dateStr });
                  }
                }}
              />
            </FormField>

            <FormField label="合作結束日期" error={errors.partnershipEndDate}>
              <DatePicker
                id="partnershipEndDate"
                placeholder="選擇結束日期（可選）"
                defaultDate={schoolData.partnershipEndDate || undefined}
                onChange={(dates, dateStr) => {
                  if (dates.length > 0) {
                    onSchoolChange({ partnershipEndDate: dateStr });
                  } else {
                    onSchoolChange({ partnershipEndDate: null });
                  }
                }}
              />
            </FormField>
          </div>

          <FormField label="合作學年" hint="根據開始日期自動計算">
            <Input
              key={`${schoolData.partnershipStartDate}-${schoolData.partnershipEndDate}`}
              type="text"
              defaultValue={
                calculateAcademicYear(
                  schoolData.partnershipStartDate,
                  schoolData.partnershipEndDate
                ) || "請先選擇開始日期"
              }
              disabled
              className="bg-gray-50 dark:bg-gray-800"
            />
          </FormField>

          <FormField
            label="確認渠道"
            required
            error={errors.confirmationChannel}
            hint="選擇或輸入確認渠道"
          >
            <SearchableSelect
              options={confirmationChannelOptions}
              placeholder="選擇確認渠道..."
              defaultValue={schoolData.confirmationChannel}
              onChange={(value) =>
                onSchoolChange({ confirmationChannel: value })
              }
              className={errors.confirmationChannel ? "border-error-500" : ""}
              allowClear={true}
              allowCreate={true}
              onCreateOption={(label) => {
                onSchoolChange({ confirmationChannel: label });
                return label;
              }}
            />
          </FormField>

          <FormField label="備註" error={errors.remarks}>
            <TextArea
              placeholder="其他備註..."
              rows={3}
              value={schoolData.remarks || ""}
              onChange={(value) => onSchoolChange({ remarks: value || "" })}
            />
          </FormField>
        </div>
      </FormCard>

      <FormCard title="聯絡人資料" description="填寫學校主要聯絡人資料">
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              label="聯絡人姓名（中文）"
              required
              error={errors.contactNameChinese}
            >
              <Input
                type="text"
                placeholder="陳老師"
                defaultValue={contactData.nameChinese}
                onChange={(e) =>
                  onContactChange({ nameChinese: e.target.value })
                }
                error={!!errors.contactNameChinese}
              />
            </FormField>

            <FormField
              label="聯絡人姓名（英文）"
              error={errors.contactNameEnglish}
            >
              <Input
                type="text"
                placeholder="Mr. Chan"
                defaultValue={contactData.nameEnglish}
                onChange={(e) =>
                  onContactChange({ nameEnglish: e.target.value })
                }
                error={!!errors.contactNameEnglish}
              />
            </FormField>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="職位" error={errors.contactPosition}>
              <SearchableSelect
                options={positionOptions}
                placeholder="選擇或輸入職位"
                defaultValue={contactData.position}
                onChange={(value) => onContactChange({ position: value })}
                className={errors.contactPosition ? "border-error-500" : ""}
                allowClear={true}
                allowCreate={true}
                onCreateOption={(label) => {
                  onContactChange({ position: label });
                  return label;
                }}
              />
            </FormField>

            <FormField label="聯絡電話" error={errors.contactPhone}>
              <PhoneInput
                value={contactData.phone}
                placeholder="2123 4567"
                onChange={(phone) => onContactChange({ phone })}
                error={!!errors.contactPhone}
                showValidation={true}
                defaultCountry="hk"
              />
            </FormField>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="手提電話" error={errors.contactMobile}>
              <PhoneInput
                value={contactData.mobile}
                placeholder="9123 4567"
                onChange={(phone) => onContactChange({ mobile: phone })}
                error={!!errors.contactMobile}
                showValidation={true}
                defaultCountry="hk"
              />
            </FormField>

            <FormField label="聯絡電郵" error={errors.contactEmail}>
              <Input
                type="email"
                placeholder="teacher@school.edu.hk"
                defaultValue={contactData.email}
                onChange={(e) => onContactChange({ email: e.target.value })}
                error={!!errors.contactEmail}
              />
            </FormField>
          </div>
        </div>
      </FormCard>
    </div>
  );
}

"use client";

import SearchableSelect from "@/components/tailadmin/form/select/SearchableSelect";
import Input from "@/components/tailadmin/form/input/InputField";
import PhoneInput from "@/components/tailadmin/form/group-input/PhoneInput";
import { FormField } from "../../common";
import FormCard from "@/components/tailadmin/form/FormCard";
import { SchoolBasicData } from "../../types";

interface School {
  id: string;
  schoolName: string;
}

interface SchoolBasicInfoCardProps {
  schoolData: SchoolBasicData;
  onSchoolChange: (data: Partial<SchoolBasicData>) => void;
  errors: Record<string, string>;
  schools: School[];
  isLoadingSchools: boolean;
  quotationId?: string;
  onSchoolSelect: (schoolId: string) => void;
}

export default function SchoolBasicInfoCard({
  schoolData,
  onSchoolChange,
  errors,
  schools,
  isLoadingSchools,
  quotationId,
  onSchoolSelect,
}: SchoolBasicInfoCardProps) {
  const schoolOptions = schools.map((school) => ({
    value: school.id,
    label: school.schoolName,
  }));

  return (
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
              onChange={onSchoolSelect}
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
              onChange={(e) => onSchoolChange({ schoolNameEn: e.target.value })}
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
  );
}

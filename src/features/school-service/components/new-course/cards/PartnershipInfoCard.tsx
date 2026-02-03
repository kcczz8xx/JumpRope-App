"use client";

import SearchableSelect from "@/components/tailadmin/form/select/SearchableSelect";
import Input from "@/components/tailadmin/form/input/InputField";
import TextArea from "@/components/tailadmin/form/input/TextArea";
import DatePicker from "@/components/tailadmin/form/date-picker";
import { FormField } from "../../common";
import FormCard from "@/components/tailadmin/form/FormCard";
import { SchoolBasicData, calculateAcademicYear } from "../../types";

const CONFIRMATION_CHANNEL_OPTIONS = [
  { value: "電話", label: "電話" },
  { value: "電郵", label: "電郵" },
  { value: "會議", label: "會議" },
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "面談", label: "面談" },
];

interface PartnershipInfoCardProps {
  schoolData: SchoolBasicData;
  onSchoolChange: (data: Partial<SchoolBasicData>) => void;
  errors: Record<string, string>;
}

export default function PartnershipInfoCard({
  schoolData,
  onSchoolChange,
  errors,
}: PartnershipInfoCardProps) {
  return (
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
            options={CONFIRMATION_CHANNEL_OPTIONS}
            placeholder="選擇確認渠道..."
            defaultValue={schoolData.confirmationChannel}
            onChange={(value) => onSchoolChange({ confirmationChannel: value })}
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
  );
}

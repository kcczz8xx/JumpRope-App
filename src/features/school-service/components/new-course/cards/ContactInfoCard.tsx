"use client";

import SearchableSelect from "@/components/tailadmin/form/select/SearchableSelect";
import Input from "@/components/tailadmin/form/input/InputField";
import PhoneInput from "@/components/tailadmin/form/group-input/PhoneInput";
import { FormField } from "../../common";
import FormCard from "@/components/tailadmin/form/FormCard";
import { SchoolContactData } from "../../types";

const POSITION_OPTIONS = [
  { value: "校長", label: "校長" },
  { value: "副校長", label: "副校長" },
  { value: "體育科主任", label: "體育科主任" },
  { value: "課外活動主任", label: "課外活動主任" },
  { value: "主任", label: "主任" },
  { value: "老師", label: "老師" },
  { value: "教練", label: "教練" },
  { value: "職員", label: "職員" },
];

interface ContactInfoCardProps {
  contactData: SchoolContactData;
  onContactChange: (data: Partial<SchoolContactData>) => void;
  errors: Record<string, string>;
}

export default function ContactInfoCard({
  contactData,
  onContactChange,
  errors,
}: ContactInfoCardProps) {
  return (
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
              onChange={(e) => onContactChange({ nameChinese: e.target.value })}
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
              onChange={(e) => onContactChange({ nameEnglish: e.target.value })}
              error={!!errors.contactNameEnglish}
            />
          </FormField>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField label="職位" error={errors.contactPosition}>
            <SearchableSelect
              options={POSITION_OPTIONS}
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
  );
}

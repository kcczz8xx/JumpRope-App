"use client";

import React, { useState } from "react";
import Checkbox from "@/components/tailadmin/form/input/Checkbox";
import Input from "@/components/tailadmin/form/input/InputField";
import Label from "@/components/tailadmin/form/Label";
import PhoneInput from "@/components/tailadmin/form/group-input/PhoneInput";
import SearchableSelect from "@/components/tailadmin/form/select/SearchableSelect";
import Link from "next/link";
import { SignUpFormData, TITLE_OPTIONS } from "./types";
import { PasswordField, SubmitButton } from "@/components/shared/forms";

interface SignUpFormStepProps {
  formData: SignUpFormData;
  onFormChange: (field: keyof SignUpFormData, value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function SignUpFormStep({
  formData,
  onFormChange,
  onSubmit,
  isLoading,
}: SignUpFormStepProps) {
  const [isChecked, setIsChecked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isChecked) return;
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label>
              稱呼 <span className="text-error-500">*</span>
            </Label>
            <SearchableSelect
              options={TITLE_OPTIONS}
              placeholder="請選擇稱呼"
              defaultValue={formData.title}
              onChange={(value) => onFormChange("title", value)}
              allowClear={false}
            />
          </div>
          <div>
            <Label>
              暱稱 <span className="text-error-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="稱呼"
              defaultValue={formData.nickname}
              onChange={(e) => onFormChange("nickname", e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label>
            電話號碼 <span className="text-error-500">*</span>
          </Label>
          <PhoneInput
            value={formData.phone}
            onChange={(value) => onFormChange("phone", value)}
            placeholder="9123 4567"
            defaultCountry="hk"
            showValidation={true}
          />
          <p className="mt-1.5 text-xs text-gray-500">
            此電話號碼將作為您的登入帳號
          </p>
        </div>

        <div>
          <Label>
            電郵地址 <span className="text-error-500">*</span>
          </Label>
          <Input
            type="email"
            placeholder="用於後備驗證及接收通知"
            defaultValue={formData.email}
            onChange={(e) => onFormChange("email", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <PasswordField
            name="password"
            label="密碼"
            placeholder="至少 8 個字元"
            value={formData.password}
            onChange={(value) => onFormChange("password", value)}
          />
          <PasswordField
            name="confirmPassword"
            label="確認密碼"
            placeholder="再次輸入密碼"
            value={formData.confirmPassword}
            onChange={(value) => onFormChange("confirmPassword", value)}
          />
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            className="w-5 h-5 mt-0.5"
            checked={isChecked}
            onChange={setIsChecked}
          />
          <p className="inline-block font-normal text-gray-500 dark:text-gray-400 text-sm">
            我已閱讀並同意{" "}
            <Link
              href="/terms"
              className="text-gray-800 dark:text-white/90 hover:underline"
            >
              服務條款
            </Link>{" "}
            和{" "}
            <Link
              href="/privacy"
              className="text-gray-800 dark:text-white hover:underline"
            >
              私隱政策
            </Link>
          </p>
        </div>

        <SubmitButton
          isLoading={isLoading}
          disabled={!isChecked}
          loadingText="處理中..."
        >
          發送驗證碼
        </SubmitButton>
      </div>
    </form>
  );
}

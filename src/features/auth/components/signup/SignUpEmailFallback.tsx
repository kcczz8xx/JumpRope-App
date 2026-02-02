"use client";

import React from "react";
import Input from "@/components/tailadmin/form/input/InputField";
import Label from "@/components/tailadmin/form/Label";
import Button from "@/components/tailadmin/ui/button/Button";
import { SignUpFormData } from "./types";

interface SignUpEmailFallbackProps {
  formData: SignUpFormData;
  onFormChange: (field: keyof SignUpFormData, value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function SignUpEmailFallback({
  formData,
  onFormChange,
  onSubmit,
  isLoading,
}: SignUpEmailFallbackProps) {
  return (
    <div className="space-y-5">
      <div>
        <Label>
          電郵地址 <span className="text-error-500">*</span>
        </Label>
        <Input
          type="email"
          placeholder="輸入您的電郵地址"
          defaultValue={formData.email}
          onChange={(e) => onFormChange("email", e.target.value)}
        />
      </div>

      <div>
        <Button
          className="w-full"
          size="sm"
          onClick={onSubmit}
          disabled={isLoading}
        >
          {isLoading ? "發送中..." : "發送驗證連結"}
        </Button>
      </div>

      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          驗證連結將發送到您的電郵，點擊連結後即可完成註冊。連結有效期為 24
          小時。
        </p>
      </div>
    </div>
  );
}

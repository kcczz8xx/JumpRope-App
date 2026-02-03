"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/tailadmin/ui/modal";
import Label from "@/components/tailadmin/form/Label";
import Input from "@/components/tailadmin/form/input/InputField";
import SearchableSelect from "@/components/tailadmin/form/select/SearchableSelect";
import Switch from "@/components/tailadmin/form/switch/Switch";
import TextArea from "@/components/tailadmin/form/input/TextArea";
import Button from "@/components/tailadmin/ui/button/Button";
import { FormError } from "@/components/shared/forms";
import { updateBankSchema, type UpdateBankInput } from "../../schemas";

export type UserBankFormData = UpdateBankInput & { fpsEnabled?: boolean };

interface UserBankEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserBankFormData) => void;
  onDelete?: () => void;
  initialData?: Partial<UserBankFormData>;
  isLoading?: boolean;
  hasExistingData?: boolean;
}

const BANK_OPTIONS = [
  { value: "中國銀行（香港）", label: "中國銀行（香港）" },
  { value: "匯豐銀行", label: "匯豐銀行" },
  { value: "恒生銀行", label: "恒生銀行" },
  { value: "渣打銀行", label: "渣打銀行" },
  { value: "東亞銀行", label: "東亞銀行" },
  { value: "星展銀行", label: "星展銀行" },
  { value: "花旗銀行", label: "花旗銀行" },
  { value: "工商銀行（亞洲）", label: "工商銀行（亞洲）" },
  { value: "建設銀行（亞洲）", label: "建設銀行（亞洲）" },
  { value: "交通銀行", label: "交通銀行" },
  { value: "招商永隆銀行", label: "招商永隆銀行" },
  { value: "大新銀行", label: "大新銀行" },
  { value: "其他", label: "其他" },
];

export default function UserBankEditModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData = {},
  isLoading = false,
  hasExistingData = false,
}: UserBankEditModalProps) {
  const [formData, setFormData] = useState<UserBankFormData>({
    bankName: "",
    accountNumber: "",
    accountHolderName: "",
    fpsId: "",
    fpsEnabled: false,
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        bankName: initialData.bankName || "",
        accountNumber: initialData.accountNumber || "",
        accountHolderName: initialData.accountHolderName || "",
        fpsId: initialData.fpsId || "",
        fpsEnabled: initialData.fpsEnabled || false,
        notes: initialData.notes || "",
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (
    field: keyof UserBankFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (typeof value === "string") {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSave = () => {
    const result = updateBankSchema.safeParse(formData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        newErrors[field] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSave({ ...result.data, fpsEnabled: formData.fpsEnabled });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[550px] p-5 lg:p-8"
    >
      <div>
        <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          編輯收款資料
        </h4>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="col-span-1 sm:col-span-2">
            <Label>所屬銀行</Label>
            <SearchableSelect
              options={BANK_OPTIONS}
              placeholder="請選擇或搜尋銀行"
              defaultValue={formData.bankName}
              onChange={(value) => handleChange("bankName", value)}
            />
            <FormError message={errors.bankName} />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>戶口號碼</Label>
            <Input
              type="text"
              placeholder="例如：012-123-456789-0"
              value={formData.accountNumber}
              onChange={(e) => handleChange("accountNumber", e.target.value)}
            />
            <FormError message={errors.accountNumber} />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>戶口持有人姓名</Label>
            <Input
              type="text"
              placeholder="請輸入戶口持有人姓名（英文）"
              value={formData.accountHolderName}
              onChange={(e) =>
                handleChange("accountHolderName", e.target.value)
              }
            />
            <FormError message={errors.accountHolderName} />
          </div>

          <div className="col-span-1">
            <Label>轉數快 ID</Label>
            <Input
              type="text"
              placeholder="電話號碼或電郵"
              value={formData.fpsId}
              onChange={(e) => handleChange("fpsId", e.target.value)}
            />
          </div>

          <div className="col-span-1 flex items-end pb-2">
            <Switch
              label="啟用轉數快"
              defaultChecked={formData.fpsEnabled}
              onChange={(checked) => handleChange("fpsEnabled", checked)}
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>備註</Label>
            <TextArea
              placeholder="選填備註"
              value={formData.notes}
              onChange={(value) => handleChange("notes", value)}
              rows={2}
            />
          </div>
        </div>

        <div className="flex items-center justify-between w-full mt-6">
          {hasExistingData && onDelete ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              disabled={isLoading}
              className="text-error-500 border-error-300 hover:bg-error-50 dark:text-error-400 dark:border-error-500/50 dark:hover:bg-error-500/10"
            >
              刪除資料
            </Button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isLoading}>
              {isLoading ? "儲存中..." : "儲存"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

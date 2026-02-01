"use client";
import React, { useState } from "react";
import { Modal } from "@/components/tailadmin/ui/modal";
import Label from "@/components/tailadmin/form/Label";
import Input from "@/components/tailadmin/form/input/InputField";
import Select from "@/components/tailadmin/form/select/Select";
import Switch from "@/components/tailadmin/form/switch/Switch";
import Button from "@/components/tailadmin/ui/button/Button";

export interface UserInfoFormData {
  title: string;
  nameChinese: string;
  nameEnglish: string;
  identityCardNumber: string;
  gender: "MALE" | "FEMALE" | "";
  email: string;
  phone: string;
  whatsappEnabled: boolean;
}

interface UserInfoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserInfoFormData) => void;
  initialData?: Partial<UserInfoFormData>;
  isLoading?: boolean;
}

const TITLE_OPTIONS = [
  { value: "先生", label: "先生" },
  { value: "女士", label: "女士" },
  { value: "小姐", label: "小姐" },
];

const GENDER_OPTIONS = [
  { value: "MALE", label: "男" },
  { value: "FEMALE", label: "女" },
];

export default function UserInfoEditModal({
  isOpen,
  onClose,
  onSave,
  initialData = {},
  isLoading = false,
}: UserInfoEditModalProps) {
  const [formData, setFormData] = useState<UserInfoFormData>({
    title: initialData.title || "",
    nameChinese: initialData.nameChinese || "",
    nameEnglish: initialData.nameEnglish || "",
    identityCardNumber: initialData.identityCardNumber || "",
    gender: initialData.gender || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    whatsappEnabled: initialData.whatsappEnabled || false,
  });

  const handleChange = (
    field: keyof UserInfoFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[600px] p-5 lg:p-8"
    >
      <form onSubmit={handleSubmit}>
        <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          編輯個人資料
        </h4>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="col-span-1">
            <Label>稱呼</Label>
            <Select
              options={TITLE_OPTIONS}
              placeholder="請選擇稱呼"
              defaultValue={formData.title}
              onChange={(value) => handleChange("title", value)}
            />
          </div>

          <div className="col-span-1">
            <Label>性別</Label>
            <Select
              options={GENDER_OPTIONS}
              placeholder="請選擇性別"
              defaultValue={formData.gender}
              onChange={(value) =>
                handleChange("gender", value as "MALE" | "FEMALE")
              }
            />
          </div>

          <div className="col-span-1">
            <Label>中文全名</Label>
            <Input
              type="text"
              placeholder="請輸入中文全名"
              defaultValue={formData.nameChinese}
              onChange={(e) => handleChange("nameChinese", e.target.value)}
            />
          </div>

          <div className="col-span-1">
            <Label>英文全名</Label>
            <Input
              type="text"
              placeholder="請輸入英文全名"
              defaultValue={formData.nameEnglish}
              onChange={(e) => handleChange("nameEnglish", e.target.value)}
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>身份證號碼</Label>
            <Input
              type="text"
              placeholder="例如：A123456(7)"
              defaultValue={formData.identityCardNumber}
              onChange={(e) =>
                handleChange("identityCardNumber", e.target.value)
              }
            />
          </div>

          <div className="col-span-1">
            <Label>電郵地址</Label>
            <Input
              type="email"
              placeholder="請輸入電郵地址"
              defaultValue={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className="col-span-1">
            <Label>電話號碼</Label>
            <Input
              type="tel"
              placeholder="請輸入電話號碼"
              defaultValue={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Switch
              label="啟用 WhatsApp 聯絡"
              defaultChecked={formData.whatsappEnabled}
              onChange={(checked) => handleChange("whatsappEnabled", checked)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end w-full gap-3 mt-6">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            size="sm"
            onClick={() => onSave(formData)}
            disabled={isLoading}
          >
            {isLoading ? "儲存中..." : "儲存"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

"use client";
import React, { useState } from "react";
import { Modal } from "@/components/tailadmin/ui/modal";
import Label from "@/components/tailadmin/form/Label";
import Input from "@/components/tailadmin/form/input/InputField";
import Select from "@/components/tailadmin/form/select/Select";
import Button from "@/components/tailadmin/ui/button/Button";

export interface UserChildFormData {
  id?: string;
  nameChinese: string;
  nameEnglish: string;
  birthYear: string;
  school: string;
  gender: "MALE" | "FEMALE" | "";
}

interface UserChildEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UserChildFormData) => void;
  onDelete?: (id: string) => void;
  initialData?: Partial<UserChildFormData>;
  isLoading?: boolean;
  mode: "create" | "edit";
}

const GENDER_OPTIONS = [
  { value: "MALE", label: "男" },
  { value: "FEMALE", label: "女" },
];

const currentYear = new Date().getFullYear();
const BIRTH_YEAR_OPTIONS = Array.from({ length: 20 }, (_, i) => {
  const year = currentYear - i;
  return { value: String(year), label: String(year) };
});

export default function UserChildEditModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData = {},
  isLoading = false,
  mode,
}: UserChildEditModalProps) {
  const [formData, setFormData] = useState<UserChildFormData>({
    id: initialData.id,
    nameChinese: initialData.nameChinese || "",
    nameEnglish: initialData.nameEnglish || "",
    birthYear: initialData.birthYear || "",
    school: initialData.school || "",
    gender: initialData.gender || "",
  });

  const handleChange = (field: keyof UserChildFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDelete = () => {
    if (formData.id && onDelete) {
      onDelete(formData.id);
    }
  };

  const isCreateMode = mode === "create";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[550px] p-5 lg:p-8"
    >
      <div>
        <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          {isCreateMode ? "新增學員" : "編輯學員資料"}
        </h4>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="col-span-1">
            <Label>中文名 *</Label>
            <Input
              type="text"
              placeholder="請輸入中文名"
              defaultValue={formData.nameChinese}
              onChange={(e) => handleChange("nameChinese", e.target.value)}
            />
          </div>

          <div className="col-span-1">
            <Label>英文名</Label>
            <Input
              type="text"
              placeholder="請輸入英文名"
              defaultValue={formData.nameEnglish}
              onChange={(e) => handleChange("nameEnglish", e.target.value)}
            />
          </div>

          <div className="col-span-1">
            <Label>性別</Label>
            <Select
              options={GENDER_OPTIONS}
              placeholder="請選擇性別"
              defaultValue={formData.gender}
              onChange={(value) => handleChange("gender", value)}
            />
          </div>

          <div className="col-span-1">
            <Label>出生年份</Label>
            <Select
              options={BIRTH_YEAR_OPTIONS}
              placeholder="請選擇出生年份"
              defaultValue={formData.birthYear}
              onChange={(value) => handleChange("birthYear", value)}
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>就讀學校</Label>
            <Input
              type="text"
              placeholder="請輸入就讀學校"
              defaultValue={formData.school}
              onChange={(e) => handleChange("school", e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between w-full mt-6">
          <div>
            {!isCreateMode && onDelete && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDelete}
                disabled={isLoading}
                className="text-error-500 ring-error-300 hover:bg-error-50 dark:text-error-400 dark:ring-error-700 dark:hover:bg-error-900/20"
              >
                刪除學員
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
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
              {isLoading ? "儲存中..." : isCreateMode ? "新增" : "儲存"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

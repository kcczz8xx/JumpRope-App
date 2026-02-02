"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/tailadmin/ui/modal";
import Label from "@/components/tailadmin/form/Label";
import Input from "@/components/tailadmin/form/input/InputField";
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
  initialData?: Partial<UserChildFormData>;
  isLoading?: boolean;
}

const GENDER_DISPLAY: Record<string, string> = {
  MALE: "男",
  FEMALE: "女",
};

export default function UserChildEditModal({
  isOpen,
  onClose,
  onSave,
  initialData = {},
  isLoading = false,
}: UserChildEditModalProps) {
  const [school, setSchool] = useState(initialData.school || "");

  useEffect(() => {
    if (isOpen && initialData) {
      setSchool(initialData.school || "");
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    onSave({
      id: initialData.id,
      nameChinese: initialData.nameChinese || "",
      nameEnglish: initialData.nameEnglish || "",
      birthYear: initialData.birthYear || "",
      school,
      gender: initialData.gender || "",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[550px] p-5 lg:p-8"
    >
      <div>
        <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          編輯學員資料
        </h4>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="col-span-1">
            <Label>中文名</Label>
            <Input
              type="text"
              value={initialData.nameChinese || ""}
              disabled
              className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
          </div>

          <div className="col-span-1">
            <Label>英文名</Label>
            <Input
              type="text"
              value={initialData.nameEnglish || "—"}
              disabled
              className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
          </div>

          <div className="col-span-1">
            <Label>性別</Label>
            <Input
              type="text"
              value={
                initialData.gender ? GENDER_DISPLAY[initialData.gender] : "—"
              }
              disabled
              className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
          </div>

          <div className="col-span-1">
            <Label>出生年份</Label>
            <Input
              type="text"
              value={initialData.birthYear || "—"}
              disabled
              className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>就讀學校</Label>
            <Input
              type="text"
              placeholder="請輸入就讀學校"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
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
    </Modal>
  );
}

"use client";
import React, { useState } from "react";
import { useModal } from "@/hooks/useModal";
import UserChildEditModal, { UserChildFormData } from "./UserChildEditModal";

interface ChildInfo {
  id: string;
  memberNumber?: string;
  nameChinese: string;
  nameEnglish?: string;
  birthYear?: number;
  school?: string;
  gender?: "男" | "女";
}

interface UserChildrenCardProps {
  children: ChildInfo[];
  onSave?: (data: UserChildFormData) => void;
  onDelete?: (id: string) => void;
}

export default function UserChildrenCard({
  children = [],
  onSave,
  onDelete,
}: UserChildrenCardProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildInfo | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");

  const genderToEnum = (g?: string): "MALE" | "FEMALE" | "" => {
    if (g === "男") return "MALE";
    if (g === "女") return "FEMALE";
    return "";
  };

  const handleAdd = () => {
    setEditingChild(null);
    setMode("create");
    openModal();
  };

  const handleEdit = (child: ChildInfo) => {
    setEditingChild(child);
    setMode("edit");
    openModal();
  };

  const handleSave = async (data: UserChildFormData) => {
    setIsLoading(true);
    try {
      if (onSave) {
        await onSave(data);
      }
      closeModal();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      if (onDelete) {
        await onDelete(id);
      }
      closeModal();
    } finally {
      setIsLoading(false);
    }
  };

  const AddButton = () => (
    <button
      onClick={handleAdd}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
      新增學員
    </button>
  );

  if (children.length === 0) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            學員資料
          </h4>
          <AddButton />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">暫無學員資料</p>

        <UserChildEditModal
          isOpen={isOpen}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
          isLoading={isLoading}
          mode={mode}
          initialData={
            editingChild
              ? {
                  id: editingChild.id,
                  nameChinese: editingChild.nameChinese,
                  nameEnglish: editingChild.nameEnglish || "",
                  birthYear: editingChild.birthYear?.toString() || "",
                  school: editingChild.school || "",
                  gender: genderToEnum(editingChild.gender),
                }
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex items-center justify-between mb-3 lg:mb-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          學員資料
        </h4>
        <AddButton />
      </div>

      <div className="space-y-4">
        {children.map((child) => (
          <div
            key={child.id}
            className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50 cursor-pointer hover:border-brand-200 dark:hover:border-brand-800 transition-colors"
            onClick={() => handleEdit(child)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-semibold text-gray-800 dark:text-white">
                  {child.nameChinese}
                </h5>
                {child.memberNumber && (
                  <span className="inline-flex rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {child.memberNumber}
                  </span>
                )}
              </div>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 lg:grid-cols-4">
              {child.nameEnglish && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    英文名
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    {child.nameEnglish}
                  </p>
                </div>
              )}

              {child.gender && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    性別
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    {child.gender}
                  </p>
                </div>
              )}

              {child.birthYear && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    出生年份
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    {child.birthYear}
                  </p>
                </div>
              )}

              {child.school && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    就讀學校
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    {child.school}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <UserChildEditModal
        isOpen={isOpen}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={handleDelete}
        isLoading={isLoading}
        mode={mode}
        initialData={
          editingChild
            ? {
                id: editingChild.id,
                nameChinese: editingChild.nameChinese,
                nameEnglish: editingChild.nameEnglish || "",
                birthYear: editingChild.birthYear?.toString() || "",
                school: editingChild.school || "",
                gender: genderToEnum(editingChild.gender),
              }
            : undefined
        }
      />
    </div>
  );
}

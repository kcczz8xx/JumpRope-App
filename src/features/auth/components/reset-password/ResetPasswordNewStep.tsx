"use client";
import React, { useState } from "react";
import Label from "@/components/tailadmin/form/Label";
import Button from "@/components/tailadmin/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";

interface ResetPasswordNewStepProps {
  isLoading: boolean;
  error: string;
  onSubmit: (password: string, confirmPassword: string) => void | Promise<void>;
}

const inputClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800";

export default function ResetPasswordNewStep({
  isLoading,
  error,
  onSubmit,
}: ResetPasswordNewStepProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    try {
      await onSubmit(newPassword, confirmPassword);
    } finally {
      setLocalLoading(false);
    }
  };

  const loading = isLoading || localLoading;

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-5">
        <div>
          <Label>
            新密碼 <span className="text-error-500">*</span>
          </Label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="至少 8 個字元"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClassName}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
            >
              {showPassword ? (
                <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
              )}
            </span>
          </div>
        </div>

        <div>
          <Label>
            確認新密碼 <span className="text-error-500">*</span>
          </Label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="再次輸入新密碼"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClassName}
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
            >
              {showConfirmPassword ? (
                <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
              ) : (
                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
              )}
            </span>
          </div>
        </div>

        <div>
          <Button className="w-full" size="sm" disabled={loading}>
            {loading ? "處理中..." : "重設密碼"}
          </Button>
        </div>
      </div>
    </form>
  );
}

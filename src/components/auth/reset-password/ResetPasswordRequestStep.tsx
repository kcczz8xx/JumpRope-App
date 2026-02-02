"use client";
import React from "react";
import Link from "next/link";
import Label from "@/components/tailadmin/form/Label";
import Input from "@/components/tailadmin/form/input/InputField";
import PhoneInput from "@/components/tailadmin/form/group-input/PhoneInput";
import Button from "@/components/tailadmin/ui/button/Button";
import { ResetMethod } from "./types";

interface ResetPasswordRequestStepProps {
  method: ResetMethod;
  phone: string;
  email: string;
  isLoading: boolean;
  error: string;
  onMethodChange: (method: ResetMethod) => void;
  onPhoneChange: (phone: string) => void;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ResetPasswordRequestStep({
  method,
  phone,
  email,
  isLoading,
  error,
  onMethodChange,
  onPhoneChange,
  onEmailChange,
  onSubmit,
}: ResetPasswordRequestStepProps) {
  return (
    <>
      <div className="mb-6">
        <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => onMethodChange("phone")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              method === "phone"
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            電話號碼
          </button>
          <button
            type="button"
            onClick={() => onMethodChange("email")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              method === "email"
                ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            電郵地址
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="space-y-5">
          {method === "phone" ? (
            <div>
              <Label>
                電話號碼 <span className="text-error-500">*</span>
              </Label>
              <PhoneInput
                value={phone}
                onChange={(value) => onPhoneChange(value)}
                placeholder="9123 4567"
                defaultCountry="hk"
                showValidation={true}
              />
            </div>
          ) : (
            <div>
              <Label>
                電郵地址 <span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="輸入您的電郵地址"
                defaultValue={email}
                onChange={(e) => onEmailChange(e.target.value)}
              />
            </div>
          )}

          <div>
            <Button className="w-full" size="sm" disabled={isLoading}>
              {isLoading
                ? "發送中..."
                : method === "phone"
                ? "發送驗證碼"
                : "發送重設連結"}
            </Button>
          </div>
        </div>
      </form>

      <div className="mt-5">
        <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
          想起密碼了？{" "}
          <Link
            href="/signin"
            className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
          >
            返回登入
          </Link>
        </p>
      </div>
    </>
  );
}

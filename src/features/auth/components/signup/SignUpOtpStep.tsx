"use client";

import React from "react";
import Label from "@/components/tailadmin/form/Label";
import { SubmitButton } from "@/components/shared/forms";

interface SignUpOtpStepProps {
  otp: string[];
  onOtpChange: (value: string, index: number) => void;
  onOtpKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => void;
  onVerify: () => void;
  onResend: () => void;
  isLoading: boolean;
  countdown: number;
}

export default function SignUpOtpStep({
  otp,
  onOtpChange,
  onOtpKeyDown,
  onVerify,
  onResend,
  isLoading,
  countdown,
}: SignUpOtpStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <Label>輸入 6 位數驗證碼</Label>
        <div className="flex gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) {
                  onOtpChange(e.target.value, index);
                }
              }}
              onKeyDown={(e) => onOtpKeyDown(e, index)}
              className="h-12 w-full rounded-lg border border-gray-300 bg-transparent text-center text-xl font-semibold text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              disabled={isLoading}
            />
          ))}
        </div>
      </div>

      <SubmitButton
        type="button"
        onClick={onVerify}
        isLoading={isLoading}
        loadingText="驗證中..."
      >
        驗證並完成註冊
      </SubmitButton>

      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          沒有收到驗證碼？{" "}
          {countdown > 0 ? (
            <span className="text-gray-400">{countdown} 秒後可重新發送</span>
          ) : (
            <button
              type="button"
              onClick={onResend}
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              disabled={isLoading}
            >
              重新發送
            </button>
          )}
        </p>
      </div>
    </div>
  );
}

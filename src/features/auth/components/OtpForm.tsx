"use client";
import Link from "next/link";
import React, { useRef, useState } from "react";
import Label from "@/components/tailadmin/form/Label";
import { ChevronLeftIcon } from "@/icons";
import {
  OtpInput,
  OtpInputRef,
  FormError,
  SubmitButton,
  useCountdown,
} from "@/components/shared/forms";

interface OtpFormProps {
  phone?: string;
  onVerify?: (otp: string) => Promise<boolean>;
  onResend?: () => Promise<void>;
  onBack?: () => void;
  backUrl?: string;
  backLabel?: string;
}

export default function OtpForm({
  phone,
  onVerify,
  onResend,
  onBack,
  backUrl = "/",
  backLabel = "返回主頁",
}: OtpFormProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const otpRef = useRef<OtpInputRef>(null);
  const { countdown, isActive, startCountdown } = useCountdown(60);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("請輸入完整的 6 位驗證碼");
      return;
    }

    setIsLoading(true);
    try {
      if (onVerify) {
        const success = await onVerify(otpCode);
        if (!success) {
          setError("驗證碼錯誤，請重新輸入");
          otpRef.current?.clear();
        }
      }
    } catch {
      setError("驗證失敗，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (isActive) return;

    setIsLoading(true);
    try {
      if (onResend) {
        await onResend();
      }
      startCountdown();
      setError("");
      otpRef.current?.clear();
    } catch {
      setError("重新發送失敗，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    if (onBack) {
      e.preventDefault();
      onBack();
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          href={backUrl}
          onClick={handleBack}
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          {backLabel}
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            驗證您的電話號碼
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {phone
              ? `驗證碼已發送至 ${phone}，請在下方輸入 6 位數驗證碼`
              : "驗證碼已發送至您的手機，請在下方輸入 6 位數驗證碼"}
          </p>
        </div>

        <FormError message={error} />

        <div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <Label>輸入 6 位數驗證碼</Label>
                <OtpInput
                  ref={otpRef}
                  value={otp}
                  onChange={setOtp}
                  disabled={isLoading}
                />
              </div>

              <SubmitButton isLoading={isLoading} loadingText="驗證中...">
                驗證
              </SubmitButton>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              沒有收到驗證碼？{" "}
              {isActive ? (
                <span className="text-gray-400">
                  {countdown} 秒後可重新發送
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  disabled={isLoading}
                >
                  重新發送
                </button>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

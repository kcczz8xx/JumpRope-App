"use client";
import React, { useRef, useState, useEffect } from "react";
import Label from "@/components/tailadmin/form/Label";
import {
  OtpInput,
  OtpInputRef,
  SubmitButton,
  useCountdown,
} from "@/components/shared/forms";

interface ResetPasswordOtpStepProps {
  phone: string;
  isLoading: boolean;
  error: string;
  onVerify: (otp: string) => void | Promise<void>;
  onResend: () => void | Promise<void>;
}

export default function ResetPasswordOtpStep({
  phone,
  isLoading,
  error,
  onVerify,
  onResend,
}: ResetPasswordOtpStepProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [localLoading, setLocalLoading] = useState(false);
  const otpRef = useRef<OtpInputRef>(null);
  const { countdown, isActive, startCountdown } = useCountdown(60);

  // 初始發送時啟動倒計時
  useEffect(() => {
    startCountdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) return;

    setLocalLoading(true);
    try {
      await onVerify(otpCode);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleResend = async () => {
    if (isActive) return;

    setLocalLoading(true);
    try {
      await onResend();
      startCountdown();
      otpRef.current?.clear();
    } finally {
      setLocalLoading(false);
    }
  };

  const loading = isLoading || localLoading;

  return (
    <div className="space-y-5">
      <div>
        <Label>輸入 6 位數驗證碼</Label>
        <OtpInput
          ref={otpRef}
          value={otp}
          onChange={setOtp}
          disabled={loading}
        />
      </div>

      <SubmitButton
        type="button"
        onClick={handleSubmit}
        isLoading={loading}
        disabled={otp.join("").length !== 6}
        loadingText="驗證中..."
      >
        驗證
      </SubmitButton>

      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          沒有收到驗證碼？{" "}
          {isActive ? (
            <span className="text-gray-400">{countdown} 秒後可重新發送</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              disabled={loading}
            >
              重新發送
            </button>
          )}
        </p>
      </div>
    </div>
  );
}

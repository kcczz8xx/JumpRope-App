"use client";
import React, { useRef, useState, useEffect } from "react";
import Label from "@/components/tailadmin/form/Label";
import Button from "@/components/tailadmin/ui/button/Button";

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
  const [countdown, setCountdown] = useState(60);
  const [localLoading, setLocalLoading] = useState(false);
  const inputsRef = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (event.key === "Backspace") {
      const updatedOtp = [...otp];

      if (!otp[index] && index > 0) {
        inputsRef.current[index - 1].focus();
      }

      updatedOtp[index] = "";
      setOtp(updatedOtp);
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1].focus();
    }

    if (event.key === "ArrowRight" && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pasteData = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");

    const updatedOtp = [...otp];
    pasteData.forEach((char, idx) => {
      if (idx < updatedOtp.length) {
        updatedOtp[idx] = char;
      }
    });

    setOtp(updatedOtp);

    const filledIndex = Math.min(pasteData.length - 1, 5);
    if (inputsRef.current[filledIndex]) {
      inputsRef.current[filledIndex].focus();
    }
  };

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
    if (countdown > 0) return;

    setLocalLoading(true);
    try {
      await onResend();
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } finally {
      setLocalLoading(false);
    }
  };

  const loading = isLoading || localLoading;

  return (
    <div className="space-y-5">
      <div>
        <Label>輸入 6 位數驗證碼</Label>
        <div className="flex gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={(e) => handlePaste(e)}
              ref={(el) => {
                if (el) {
                  inputsRef.current[index] = el;
                }
              }}
              className="h-12 w-full rounded-lg border border-gray-300 bg-transparent text-center text-xl font-semibold text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              disabled={loading}
            />
          ))}
        </div>
      </div>

      <div>
        <Button
          className="w-full"
          size="sm"
          onClick={handleSubmit}
          disabled={loading || otp.join("").length !== 6}
        >
          {loading ? "驗證中..." : "驗證"}
        </Button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          沒有收到驗證碼？{" "}
          {countdown > 0 ? (
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

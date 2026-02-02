"use client";
import Link from "next/link";
import React, { useRef, useState, useEffect } from "react";
import Label from "@/components/tailadmin/form/Label";
import Button from "@/components/tailadmin/ui/button/Button";
import { ChevronLeftIcon } from "@/icons";

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
  const [countdown, setCountdown] = useState(0);
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
          setOtp(["", "", "", "", "", ""]);
          inputsRef.current[0]?.focus();
        }
      }
    } catch {
      setError("驗證失敗，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    try {
      if (onResend) {
        await onResend();
      }
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      setError("");
      inputsRef.current[0]?.focus();
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

        {error && (
          <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
            {error}
          </div>
        )}

        <div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <Label>輸入 6 位數驗證碼</Label>
                <div className="flex gap-2 sm:gap-3" id="otp-container">
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
                      className="h-12 w-full rounded-lg border border-gray-300 bg-transparent text-center text-xl font-semibold text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Button className="w-full" size="sm" disabled={isLoading}>
                  {isLoading ? "驗證中..." : "驗證"}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              沒有收到驗證碼？{" "}
              {countdown > 0 ? (
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

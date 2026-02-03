"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import { SignUpStep, SignUpFormData } from "./types";
import SignUpFormStep from "./SignUpFormStep";
import SignUpOtpStep from "./SignUpOtpStep";
import SignUpEmailFallback from "./SignUpEmailFallback";
import { sendOtpAction, verifyOtpAction, registerAction } from "../../actions";
import { FormError, useCountdown } from "@/components/shared/forms";
import { signUpFormSchema } from "../../schemas";

export default function SignUpForm() {
  const [step, setStep] = useState<SignUpStep>("form");
  const [formData, setFormData] = useState<SignUpFormData>({
    phone: "",
    password: "",
    confirmPassword: "",
    email: "",
    nickname: "",
    title: "",
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const { countdown, startCountdown } = useCountdown(60);

  const handleFormChange = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const result = signUpFormSchema.safeParse(formData);
    if (!result.success) {
      const firstError = result.error.issues[0];
      setError(firstError?.message || "表單驗證失敗");
      return false;
    }
    return true;
  };

  const handleSendOtp = () => {
    setError("");
    if (!validateForm()) return;

    startTransition(async () => {
      const result = await sendOtpAction({
        phone: formData.phone,
        email: formData.email,
        purpose: "register",
      });

      if (!result.success) {
        setError(result.error.message);
        return;
      }

      setStep("otp");
      startCountdown();
    });
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = () => {
    setError("");
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("請輸入完整的 6 位驗證碼");
      return;
    }

    startTransition(async () => {
      const verifyResult = await verifyOtpAction({
        phone: formData.phone,
        code: otpCode,
        purpose: "register",
      });

      if (!verifyResult.success) {
        const newAttempts = otpAttempts + 1;
        setOtpAttempts(newAttempts);

        if (newAttempts >= 3) {
          setStep("email-fallback");
          setError("驗證碼錯誤次數過多，請使用電郵驗證");
        } else {
          setError(
            verifyResult.error.message ||
              `驗證碼錯誤，還有 ${3 - newAttempts} 次機會`
          );
        }
        return;
      }

      const registerResult = await registerAction({
        phone: formData.phone,
        password: formData.password,
        email: formData.email,
        nickname: formData.nickname,
        title: formData.title,
      });

      if (!registerResult.success) {
        setError(registerResult.error.message);
        return;
      }

      window.location.href = "/signin";
    });
  };

  const handleEmailVerification = () => {
    setError("");

    if (!formData.email) {
      setError("請輸入電郵地址");
      return;
    }

    // TODO: 調用發送電郵驗證 API
    alert("驗證連結已發送到您的電郵，請查收");
  };

  const handleResendOtp = () => {
    if (countdown > 0) return;

    startTransition(async () => {
      const result = await sendOtpAction({
        phone: formData.phone,
        email: formData.email,
        purpose: "register",
      });

      if (!result.success) {
        setError(result.error.message);
        return;
      }

      startCountdown();
      setOtp(["", "", "", "", "", ""]);
    });
  };

  const getStepTitle = () => {
    switch (step) {
      case "form":
        return "註冊帳戶";
      case "otp":
        return "驗證電話號碼";
      case "email-fallback":
        return "電郵驗證";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case "form":
        return "輸入您的資料以建立帳戶";
      case "otp":
        return `驗證碼已發送至 ${formData.phone}，請在下方輸入`;
      case "email-fallback":
        return "電話驗證失敗次數過多，請使用電郵完成驗證";
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href={step === "form" ? "/" : "#"}
          onClick={(e) => {
            if (step !== "form") {
              e.preventDefault();
              setStep("form");
              setError("");
            }
          }}
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          {step === "form" ? "返回主頁" : "返回上一步"}
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              {getStepTitle()}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getStepDescription()}
            </p>
          </div>

          <FormError message={error} />

          <div>
            {step === "form" && (
              <SignUpFormStep
                formData={formData}
                onFormChange={handleFormChange}
                onSubmit={handleSendOtp}
                isLoading={isPending}
              />
            )}

            {step === "otp" && (
              <SignUpOtpStep
                otp={otp}
                onOtpChange={handleOtpChange}
                onOtpKeyDown={handleOtpKeyDown}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
                isLoading={isPending}
                countdown={countdown}
              />
            )}

            {step === "email-fallback" && (
              <SignUpEmailFallback
                formData={formData}
                onFormChange={handleFormChange}
                onSubmit={handleEmailVerification}
                isLoading={isPending}
              />
            )}

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                已有帳戶？{" "}
                <Link
                  href="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  立即登入
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

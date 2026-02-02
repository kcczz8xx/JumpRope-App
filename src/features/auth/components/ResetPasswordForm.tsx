"use client";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";
import { FormError } from "@/components/shared/forms";
import { ResetMethod, ResetStep } from "./reset-password/types";
import ResetPasswordRequestStep from "./reset-password/ResetPasswordRequestStep";
import ResetPasswordOtpStep from "./reset-password/ResetPasswordOtpStep";
import ResetPasswordNewStep from "./reset-password/ResetPasswordNewStep";
import ResetPasswordSuccessStep from "./reset-password/ResetPasswordSuccessStep";
import { isValidPhoneNumber } from "libphonenumber-js";
import {
  resetPasswordSendAction,
  resetPasswordVerifyAction,
  resetPasswordAction,
} from "../actions";

export default function ResetPasswordForm() {
  const [method, setMethod] = useState<ResetMethod>("phone");
  const [step, setStep] = useState<ResetStep>("request");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const identifier = method === "phone" ? phone : email;
    if (!identifier) {
      setError(method === "phone" ? "請輸入電話號碼" : "請輸入電郵地址");
      return;
    }

    if (method === "phone" && !isValidPhoneNumber(phone)) {
      setError("請輸入有效的電話號碼格式");
      return;
    }

    startTransition(async () => {
      const result = await resetPasswordSendAction(
        method === "phone" ? { phone } : { email }
      );

      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      if (method === "phone") {
        setStep("otp");
      } else {
        alert("重設密碼連結已發送到您的電郵，請查收");
      }
    });
  };

  const handleVerifyOtp = (otpCode: string) => {
    setError("");

    if (otpCode.length !== 6) {
      setError("請輸入完整的 6 位驗證碼");
      return;
    }

    startTransition(async () => {
      const result = await resetPasswordVerifyAction({ phone, code: otpCode });

      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      setResetToken(result.data.resetToken);
      setStep("new-password");
    });
  };

  const handleResendOtp = () => {
    startTransition(async () => {
      const result = await resetPasswordSendAction({ phone });

      if (!result.ok) {
        setError(result.error.message);
      }
    });
  };

  const handleResetPassword = (
    newPassword: string,
    confirmPassword: string
  ) => {
    setError("");

    if (!newPassword) {
      setError("請輸入新密碼");
      return;
    }
    if (newPassword.length < 8) {
      setError("密碼至少需要 8 個字元");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("兩次輸入的密碼不一致");
      return;
    }

    startTransition(async () => {
      const result = await resetPasswordAction({
        phone,
        password: newPassword,
        resetToken,
      });

      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      setStep("success");
    });
  };

  const getBackAction = () => {
    if (step === "request") {
      return { href: "/signin", label: "返回登入" };
    }
    return {
      href: "#",
      label: "返回上一步",
      onClick: () => {
        if (step === "otp") setStep("request");
        else if (step === "new-password") setStep("otp");
        setError("");
      },
    };
  };

  const backAction = getBackAction();

  const getStepTitle = () => {
    switch (step) {
      case "request":
        return "忘記密碼？";
      case "otp":
        return "驗證身份";
      case "new-password":
        return "設定新密碼";
      case "success":
        return "密碼已重設";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case "request":
        return "輸入您註冊時使用的電話號碼或電郵地址，我們將發送驗證碼給您";
      case "otp":
        return `驗證碼已發送至 ${phone}，請在下方輸入`;
      case "new-password":
        return "請設定您的新密碼";
      case "success":
        return "您的密碼已成功重設，現在可以使用新密碼登入";
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          href={backAction.href}
          onClick={(e) => {
            if (backAction.onClick) {
              e.preventDefault();
              backAction.onClick();
            }
          }}
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          {backAction.label}
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            {getStepTitle()}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getStepDescription()}
          </p>
        </div>

        <FormError message={error} className="mb-4" />

        <div>
          {step === "request" && (
            <ResetPasswordRequestStep
              method={method}
              phone={phone}
              email={email}
              isLoading={isPending}
              error={error}
              onMethodChange={setMethod}
              onPhoneChange={setPhone}
              onEmailChange={setEmail}
              onSubmit={handleSendCode}
            />
          )}

          {step === "otp" && (
            <ResetPasswordOtpStep
              phone={phone}
              isLoading={isPending}
              error={error}
              onVerify={handleVerifyOtp}
              onResend={handleResendOtp}
            />
          )}

          {step === "new-password" && (
            <ResetPasswordNewStep
              isLoading={isPending}
              error={error}
              onSubmit={handleResetPassword}
            />
          )}

          {step === "success" && <ResetPasswordSuccessStep />}
        </div>
      </div>
    </div>
  );
}

export { default as ResetPasswordRequestStep } from "./reset-password/ResetPasswordRequestStep";
export { default as ResetPasswordOtpStep } from "./reset-password/ResetPasswordOtpStep";
export { default as ResetPasswordNewStep } from "./reset-password/ResetPasswordNewStep";
export { default as ResetPasswordSuccessStep } from "./reset-password/ResetPasswordSuccessStep";
export type {
  ResetMethod,
  ResetStep,
  ResetPasswordState,
} from "./reset-password/types";

"use client";
import React, { useState, useRef, useEffect, useTransition } from "react";
import { Modal } from "@/components/tailadmin/ui/modal";
import Label from "@/components/tailadmin/form/Label";
import Input from "@/components/tailadmin/form/input/InputField";
import Switch from "@/components/tailadmin/form/switch/Switch";
import PhoneInput from "@/components/tailadmin/form/group-input/PhoneInput";
import { sendOtpAction, verifyOtpAction } from "@/features/auth";
import {
  OtpInput,
  OtpInputRef,
  FormError,
  useCountdown,
} from "@/components/shared/forms";

export interface UserInfoFormData {
  nickname: string;
  title: string;
  nameChinese: string;
  nameEnglish: string;
  identityCardNumber: string;
  gender: "MALE" | "FEMALE" | "";
  email: string;
  phone: string;
  whatsappEnabled: boolean;
}

interface UserInfoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<UserInfoFormData>) => void;
  initialData?: Partial<UserInfoFormData>;
  isLoading?: boolean;
}

type EditStep = "form" | "otp-email" | "otp-phone";

const GENDER_LABELS: Record<string, string> = {
  MALE: "男",
  FEMALE: "女",
};

export default function UserInfoEditModal({
  isOpen,
  onClose,
  onSave,
  initialData = {},
  isLoading = false,
}: UserInfoEditModalProps) {
  const [step, setStep] = useState<EditStep>("form");
  const [nickname, setNickname] = useState(initialData.nickname || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [whatsappEnabled, setWhatsappEnabled] = useState(
    initialData.whatsappEnabled || false
  );
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [isPending, startTransition] = useTransition();
  const { countdown, isActive, startCountdown } = useCountdown(60);
  const [pendingField, setPendingField] = useState<"email" | "phone" | null>(
    null
  );
  const [pendingValue, setPendingValue] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailNeedsVerify, setEmailNeedsVerify] = useState(false);
  const otpRef = useRef<OtpInputRef>(null);

  const originalEmail = initialData.email || "";
  const originalPhone = initialData.phone || "";

  useEffect(() => {
    if (isOpen) {
      setStep("form");
      setNickname(initialData.nickname || "");
      setEmail(initialData.email || "");
      setPhone(initialData.phone || "");
      setWhatsappEnabled(initialData.whatsappEnabled || false);
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
      setPendingField(null);
      setPendingValue("");
      setPhoneVerified(false);
      setEmailNeedsVerify(false);
    }
  }, [isOpen, initialData]);

  const sendOtp = async (
    field: "email" | "phone",
    value: string
  ): Promise<boolean> => {
    setOtpError("");
    const result = await sendOtpAction({
      phone: field === "phone" ? value : originalPhone,
      email: field === "email" ? value : undefined,
      purpose: "update-contact",
    });

    if (!result.ok) {
      setOtpError(result.error.message);
      return false;
    }
    startCountdown();
    return true;
  };

  const verifyOtp = async (): Promise<boolean> => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setOtpError("請輸入完整的 6 位驗證碼");
      return false;
    }
    setOtpError("");

    const result = await verifyOtpAction({
      phone: pendingField === "phone" ? pendingValue : originalPhone,
      code: otpCode,
      purpose: "update-contact",
    });

    if (!result.ok) {
      setOtpError(result.error.message);
      otpRef.current?.clear();
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailChanged = email !== originalEmail;
    const phoneChanged = phone !== originalPhone;

    startTransition(async () => {
      // Step 1: 從表單提交，同時發送所有需要的 OTP
      if (step === "form") {
        // 同時發送兩者的 OTP（如果都有變更）
        if (phoneChanged && emailChanged) {
          setEmailNeedsVerify(true);
          // 同時發送兩個 OTP
          const [phoneSent, emailSent] = await Promise.all([
            sendOtp("phone", phone),
            sendOtp("email", email),
          ]);
          if (phoneSent && emailSent) {
            setPendingField("phone");
            setPendingValue(phone);
            setStep("otp-phone");
            setOtp(["", "", "", "", "", ""]);
          }
          return;
        }

        // 只有電話變更
        if (phoneChanged) {
          setPendingField("phone");
          setPendingValue(phone);
          const sent = await sendOtp("phone", phone);
          if (sent) {
            setStep("otp-phone");
            setOtp(["", "", "", "", "", ""]);
          }
          return;
        }

        // 只有電郵變更
        if (emailChanged) {
          setPendingField("email");
          setPendingValue(email);
          const sent = await sendOtp("email", email);
          if (sent) {
            setStep("otp-email");
            setOtp(["", "", "", "", "", ""]);
          }
          return;
        }
      }

      // Step 2: 驗證電話 OTP
      if (step === "otp-phone") {
        const verified = await verifyOtp();
        if (!verified) return;
        setPhoneVerified(true);

        // 如果 email 也需要驗證，進入 email OTP 步驟
        if (emailNeedsVerify) {
          setPendingField("email");
          setPendingValue(email);
          setStep("otp-email");
          setOtp(["", "", "", "", "", ""]);
          return;
        }
      }

      // Step 3: 驗證電郵 OTP
      if (step === "otp-email") {
        const verified = await verifyOtp();
        if (!verified) return;
      }

      // 所有驗證完成，提交資料
      onSave({
        nickname,
        email,
        phone,
        whatsappEnabled,
      });
    });
  };

  const handleResendOtp = () => {
    if (isActive || !pendingField || !pendingValue) return;
    startTransition(async () => {
      await sendOtp(pendingField, pendingValue);
      otpRef.current?.clear();
    });
  };

  const handleBackToForm = () => {
    setStep("form");
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setPendingField(null);
    setPendingValue("");
  };

  const renderOtpStep = (fieldLabel: string) => (
    <div>
      <button
        type="button"
        onClick={handleBackToForm}
        className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        返回
      </button>
      <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
        驗證{fieldLabel}
      </h4>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        驗證碼已發送至 {pendingValue}，請輸入 6 位數驗證碼
      </p>

      <FormError message={otpError} className="mb-4" />

      <div className="mb-4">
        <OtpInput
          ref={otpRef}
          value={otp}
          onChange={setOtp}
          disabled={isPending}
        />
      </div>

      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        沒有收到驗證碼？{" "}
        {isActive ? (
          <span className="text-gray-400">{countdown} 秒後可重新發送</span>
        ) : (
          <button
            type="button"
            onClick={handleResendOtp}
            className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
            disabled={isPending}
          >
            重新發送
          </button>
        )}
      </p>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending || isLoading}
          className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-3 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/3 dark:hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isPending || isLoading}
          className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "驗證中..." : "確認驗證"}
        </button>
      </div>
    </div>
  );

  const renderFormStep = () => (
    <div>
      <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
        編輯個人資料
      </h4>

      {/* 唯讀欄位 */}
      <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <p className="mb-3 text-xs font-medium text-gray-500 dark:text-gray-400">
          以下資料無法自行修改，如需變更請聯絡客服
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">稱呼：</span>
            <span className="ml-2 text-gray-800 dark:text-white/90">
              {initialData.title || "-"}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">性別：</span>
            <span className="ml-2 text-gray-800 dark:text-white/90">
              {initialData.gender ? GENDER_LABELS[initialData.gender] : "-"}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">中文全名：</span>
            <span className="ml-2 text-gray-800 dark:text-white/90">
              {initialData.nameChinese || "-"}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">英文全名：</span>
            <span className="ml-2 text-gray-800 dark:text-white/90">
              {initialData.nameEnglish || "-"}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500 dark:text-gray-400">
              身份證號碼：
            </span>
            <span className="ml-2 text-gray-800 dark:text-white/90">
              {initialData.identityCardNumber || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* 可編輯欄位 */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <div className="col-span-1 sm:col-span-2">
          <Label>暱稱</Label>
          <Input
            type="text"
            placeholder="請輸入暱稱"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        <div className="col-span-1">
          <Label>
            電郵地址
            {email !== originalEmail && (
              <span className="ml-2 text-xs text-warning-500">需驗證</span>
            )}
          </Label>
          <Input
            type="email"
            placeholder="請輸入電郵地址"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="col-span-1">
          <Label>
            電話號碼
            {phone !== originalPhone && (
              <span className="ml-2 text-xs text-warning-500">需驗證</span>
            )}
          </Label>
          <PhoneInput
            value={phone}
            onChange={(value) => setPhone(value)}
            placeholder="9123 4567"
            defaultCountry="hk"
            showValidation={true}
          />
        </div>

        <div className="col-span-1 sm:col-span-2">
          <Switch
            label="啟用 WhatsApp 聯絡"
            defaultChecked={whatsappEnabled}
            onChange={(checked) => setWhatsappEnabled(checked)}
          />
        </div>
      </div>

      <div className="flex items-center justify-end w-full gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading || isPending}
          className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-3 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/3 dark:hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isLoading || isPending}
          className="inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading || isPending ? "處理中..." : "儲存"}
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[600px] p-5 lg:p-8"
    >
      <form onSubmit={handleSubmit}>
        {step === "form" && renderFormStep()}
        {step === "otp-email" && renderOtpStep("新電郵地址")}
        {step === "otp-phone" && renderOtpStep("新電話號碼")}
      </form>
    </Modal>
  );
}

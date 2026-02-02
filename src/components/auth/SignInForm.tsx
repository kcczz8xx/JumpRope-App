"use client";
import Checkbox from "@/components/tailadmin/form/input/Checkbox";
import Label from "@/components/tailadmin/form/Label";
import Button from "@/components/tailadmin/ui/button/Button";
import PhoneInput from "@/components/tailadmin/form/group-input/PhoneInput";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { isValidPhoneNumber } from "libphonenumber-js";

type LoginMethod = "phone" | "memberNumber";

export default function SignInForm() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("phone");
  const [phone, setPhone] = useState("");
  const [memberNumber, setMemberNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const identifier = loginMethod === "phone" ? phone : memberNumber;

    if (!identifier) {
      setError(loginMethod === "phone" ? "請輸入電話號碼" : "請輸入會員編號");
      setIsLoading(false);
      return;
    }

    if (loginMethod === "phone" && !isValidPhoneNumber(phone)) {
      setError("請輸入有效的電話號碼格式");
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError("請輸入密碼");
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("電話號碼/會員編號或密碼錯誤");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("登入失敗，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          返回主頁
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              登入
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              使用電話號碼或會員編號登入您的帳戶
            </p>
          </div>
          <div>
            <div className="mb-6">
              <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => setLoginMethod("phone")}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                    loginMethod === "phone"
                      ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  電話號碼
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod("memberNumber")}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                    loginMethod === "memberNumber"
                      ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  會員編號
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-error-50 p-3 text-sm text-error-600 dark:bg-error-500/10 dark:text-error-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {loginMethod === "phone" ? (
                  <div>
                    <Label>
                      電話號碼 <span className="text-error-500">*</span>
                    </Label>
                    <PhoneInput
                      value={phone}
                      onChange={(value) => setPhone(value)}
                      placeholder="9123 4567"
                      defaultCountry="hk"
                      showValidation={true}
                    />
                  </div>
                ) : (
                  <div>
                    <Label>
                      會員編號 <span className="text-error-500">*</span>
                    </Label>
                    <input
                      type="text"
                      placeholder="例如：M00001"
                      value={memberNumber}
                      onChange={(e) => setMemberNumber(e.target.value)}
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>
                )}

                <div>
                  <Label>
                    密碼 <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="輸入您的密碼"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      保持登入狀態
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    忘記密碼？
                  </Link>
                </div>

                <div>
                  <Button className="w-full" size="sm" disabled={isLoading}>
                    {isLoading ? "登入中..." : "登入"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                還沒有帳戶？{" "}
                <Link
                  href="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  立即註冊
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

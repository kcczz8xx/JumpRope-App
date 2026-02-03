"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Checkbox from "@/components/tailadmin/form/input/Checkbox";
import Label from "@/components/tailadmin/form/Label";
import PhoneInput from "@/components/tailadmin/form/group-input/PhoneInput";
import { ChevronLeftIcon } from "@/icons";
import {
  PasswordField,
  FormError,
  SubmitButton,
  LoginMethodToggle,
} from "@/components/shared/forms";
import {
  signInSchema,
  type SignInInput,
  type LoginMethod,
} from "../../schemas";

const LOGIN_OPTIONS = [
  { value: "phone", label: "電話號碼" },
  { value: "memberNumber", label: "會員編號" },
];

export default function SignInForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      loginMethod: "phone",
      identifier: "",
      password: "",
      rememberMe: false,
    },
  });

  const loginMethod = watch("loginMethod");

  const onSubmit = (data: SignInInput) => {
    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          identifier: data.identifier,
          password: data.password,
          redirect: false,
        });
        if (result?.error) {
          setError("root", { message: "電話號碼/會員編號或密碼錯誤" });
          return;
        }
        router.push("/dashboard");
        router.refresh();
      } catch {
        setError("root", { message: "登入失敗，請稀後再試" });
      }
    });
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
              <Controller
                name="loginMethod"
                control={control}
                render={({ field }) => (
                  <LoginMethodToggle
                    value={field.value}
                    onChange={(v) => field.onChange(v as LoginMethod)}
                    options={LOGIN_OPTIONS}
                  />
                )}
              />
            </div>
            <FormError
              message={errors.root?.message || errors.identifier?.message}
            />
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                {loginMethod === "phone" ? (
                  <div>
                    <Label>
                      電話號碼 <span className="text-error-500">*</span>
                    </Label>
                    <Controller
                      name="identifier"
                      control={control}
                      render={({ field }) => (
                        <PhoneInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="9123 4567"
                          defaultCountry="hk"
                          showValidation={true}
                        />
                      )}
                    />
                  </div>
                ) : (
                  <div>
                    <Label>
                      會員編號 <span className="text-error-500">*</span>
                    </Label>
                    <Controller
                      name="identifier"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="text"
                          placeholder="例如：M00001"
                          value={field.value}
                          onChange={field.onChange}
                          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                        />
                      )}
                    />
                  </div>
                )}
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <PasswordField
                      name="password"
                      label="密碼"
                      placeholder="輸入您的密碼"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.password && (
                  <p className="text-sm text-error-500 -mt-4">
                    {errors.password.message}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Controller
                      name="rememberMe"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
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
                <SubmitButton isLoading={isPending} loadingText="登入中...">
                  登入
                </SubmitButton>
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

"use client";
import React from "react";
import { useModal } from "@/hooks/useModal";
import { parsePhoneNumber } from "libphonenumber-js";
import { useUpdateProfile } from "@/hooks/useUserActions";
import UserInfoEditModal, { UserInfoFormData } from "./UserInfoEditModal";

const formatPhoneNumber = (phone: string | null | undefined) => {
  if (!phone) return "";
  try {
    const phoneNumber = parsePhoneNumber(phone);
    if (phoneNumber) {
      return phoneNumber.formatInternational();
    }
  } catch {
    // 如果解析失敗，返回原始值
  }
  return phone;
};

interface UserInfoCardProps {
  nickname?: string;
  title?: string;
  nameChinese?: string;
  nameEnglish?: string;
  identityCardNumber?: string;
  gender?: "男" | "女" | "";
  email?: string;
  phone?: string;
  whatsappEnabled?: boolean;
  memberNumber?: string;
}

export default function UserInfoCard({
  nickname = "",
  title = "",
  nameChinese = "",
  nameEnglish = "",
  identityCardNumber = "",
  gender = "",
  email = "",
  phone = "",
  whatsappEnabled = false,
  memberNumber = "",
}: UserInfoCardProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const { isSubmitting, submit } = useUpdateProfile(closeModal);

  const handleSave = async (data: Partial<UserInfoFormData>) => {
    await submit(data);
  };

  const genderToEnum = (g: string): "MALE" | "FEMALE" | "" => {
    if (g === "男") return "MALE";
    if (g === "女") return "FEMALE";
    return "";
  };
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-3 lg:mb-6">
            個人資料
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            {memberNumber && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  會員編號
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {memberNumber}
                </p>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                暱稱
              </p>
              {nickname ? (
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {nickname}
                </p>
              ) : (
                <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  未填寫
                </span>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                稱呼
              </p>
              {title ? (
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {title}
                </p>
              ) : (
                <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  未填寫
                </span>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                中文全名
              </p>
              {nameChinese ? (
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {nameChinese}
                </p>
              ) : (
                <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  未填寫
                </span>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                英文全名
              </p>
              {nameEnglish ? (
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {nameEnglish}
                </p>
              ) : (
                <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  未填寫
                </span>
              )}
            </div>

            {identityCardNumber && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  身份證號碼
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {identityCardNumber}
                </p>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                性別
              </p>
              {gender ? (
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {gender}
                </p>
              ) : (
                <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  未填寫
                </span>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                電郵地址
              </p>
              {email ? (
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {email}
                </p>
              ) : (
                <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  未填寫
                </span>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                電話號碼
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {formatPhoneNumber(phone)}
                </p>
                {whatsappEnabled && phone && (
                  <span className="inline-flex rounded-full bg-success-100 px-2 py-0.5 text-xs font-medium text-success-600 dark:bg-success-900/30 dark:text-success-400">
                    WhatsApp
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          編輯
        </button>
      </div>

      <UserInfoEditModal
        isOpen={isOpen}
        onClose={closeModal}
        onSave={handleSave}
        isLoading={isSubmitting}
        initialData={{
          nickname,
          title,
          nameChinese,
          nameEnglish,
          identityCardNumber,
          gender: genderToEnum(gender),
          email,
          phone,
          whatsappEnabled,
        }}
      />
    </div>
  );
}

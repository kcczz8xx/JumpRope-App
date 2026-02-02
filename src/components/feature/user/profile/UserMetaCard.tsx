"use client";
import React, { useState } from "react";
import { signOut } from "next-auth/react";
import UserChangePasswordModal from "./UserChangePasswordModal";

interface UserMetaCardProps {
  name?: string;
  role?: string;
  onAccountSettings?: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const KeyIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
    />
  </svg>
);

const SettingsIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

export default function UserMetaCard({
  name = "用戶",
  role = "繩院用戶",
  onAccountSettings,
}: UserMetaCardProps) {
  const initials = getInitials(name);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: "/signin" });
  };

  return (
    <>
      <UserChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-gray-200 bg-brand-100 dark:border-gray-800 dark:bg-brand-900/30">
              <span className="text-2xl font-semibold text-brand-600 dark:text-brand-400">
                {initials}
              </span>
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {name}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                  {role}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 lg:flex-nowrap xl:order-3 xl:justify-end">
            <button
              type="button"
              onClick={() => setIsChangePasswordOpen(true)}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3 dark:hover:text-gray-200"
            >
              <KeyIcon />
              <span>修改密碼</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border border-error-300 bg-white px-4 py-2.5 text-sm font-medium text-error-600 shadow-theme-xs hover:bg-error-50 dark:border-error-700 dark:bg-gray-800 dark:text-error-400 dark:hover:bg-error-900/20"
            >
              <LogoutIcon />
              <span>登出</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";
import React from "react";

interface UserMetaCardProps {
  name?: string;
  role?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function UserMetaCard({
  name = "用戶",
  role = "繩院用戶",
}: UserMetaCardProps) {
  const initials = getInitials(name);

  return (
    <>
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
        </div>
      </div>
    </>
  );
}

"use client";

import React from "react";
import ComponentCard from "@/components/tailadmin/common/ComponentCard";
import { SchoolBasicInfo } from "./types";
import { formatPhoneNumber } from "./helpers";

interface SchoolBasicInfoSectionProps {
  school: SchoolBasicInfo;
}

export default function SchoolBasicInfoSection({ school }: SchoolBasicInfoSectionProps) {
  return (
    <ComponentCard title="學校基本資料">
      <div className="space-y-4">
        <div>
          <label className="text-theme-xs text-gray-500 dark:text-gray-400">學校名稱</label>
          <p className="text-theme-sm font-medium text-gray-800 dark:text-white">
            {school.schoolName}
          </p>
          {school.schoolNameEn && (
            <p className="text-theme-xs text-gray-600 dark:text-gray-400">
              {school.schoolNameEn}
            </p>
          )}
        </div>

        {school.schoolCode && (
          <div>
            <label className="text-theme-xs text-gray-500 dark:text-gray-400">學校編號</label>
            <p className="text-theme-sm text-gray-800 dark:text-white">{school.schoolCode}</p>
          </div>
        )}

        <div>
          <label className="text-theme-xs text-gray-500 dark:text-gray-400">地址</label>
          <p className="text-theme-sm text-gray-800 dark:text-white">{school.address}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {school.phone && (
            <div>
              <label className="text-theme-xs text-gray-500 dark:text-gray-400">電話</label>
              <p className="text-theme-sm text-gray-800 dark:text-white">{formatPhoneNumber(school.phone)}</p>
            </div>
          )}
          {school.fax && (
            <div>
              <label className="text-theme-xs text-gray-500 dark:text-gray-400">傳真</label>
              <p className="text-theme-sm text-gray-800 dark:text-white">{formatPhoneNumber(school.fax)}</p>
            </div>
          )}
        </div>

        {school.email && (
          <div>
            <label className="text-theme-xs text-gray-500 dark:text-gray-400">電郵</label>
            <p className="text-theme-sm text-gray-800 dark:text-white">
              <a href={`mailto:${school.email}`} className="text-brand-500 hover:underline">
                {school.email}
              </a>
            </p>
          </div>
        )}

        {school.website && (
          <div>
            <label className="text-theme-xs text-gray-500 dark:text-gray-400">網站</label>
            <p className="text-theme-sm text-gray-800 dark:text-white">
              <a
                href={school.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-500 hover:underline"
              >
                {school.website}
              </a>
            </p>
          </div>
        )}
      </div>
    </ComponentCard>
  );
}

"use client";

import React from "react";
import ComponentCard from "@/components/tailadmin/common/ComponentCard";
import { PartnershipInfo, AcademicYearData, PARTNERSHIP_STATUS_MAP } from "./types";
import { formatDate, formatCurrency, formatYearLabel } from "./helpers";
import YearSelect from "./YearSelect";

interface PartnershipInfoSectionProps {
  school: PartnershipInfo & { remarks?: string | null };
  academicYears: AcademicYearData[];
  selectedYear: string;
  onYearChange: (year: string) => void;
}

export default function PartnershipInfoSection({
  school,
  academicYears,
  selectedYear,
  onYearChange,
}: PartnershipInfoSectionProps) {
  const selectedYearData = academicYears.find((y) => y.year === selectedYear);
  const statusInfo = PARTNERSHIP_STATUS_MAP[school.partnershipStatus] || {
    label: school.partnershipStatus,
    color: "bg-gray-100 text-gray-800",
  };

  return (
    <ComponentCard
      title="合作資料"
      headerAction={
        academicYears.length > 0 ? (
          <YearSelect
            years={academicYears}
            selectedYear={selectedYear}
            onYearChange={onYearChange}
          />
        ) : undefined
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-theme-xs text-gray-500 dark:text-gray-400">合作狀態</label>
            <div className="mt-1">
              <span className={`inline-flex rounded-full px-2 py-0.5 text-theme-xs font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
          <div>
            <label className="text-theme-xs text-gray-500 dark:text-gray-400">確認渠道</label>
            <p className="text-theme-sm text-gray-800 dark:text-white">
              {school.confirmationChannel || "-"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-theme-xs text-gray-500 dark:text-gray-400">合作開始日期</label>
            <p className="text-theme-sm text-gray-800 dark:text-white">
              {formatDate(school.partnershipStartDate)}
            </p>
          </div>
          <div>
            <label className="text-theme-xs text-gray-500 dark:text-gray-400">合作結束日期</label>
            <p className="text-theme-sm text-gray-800 dark:text-white">
              {formatDate(school.partnershipEndDate)}
            </p>
          </div>
        </div>

        {school.remarks && (
          <div>
            <label className="text-theme-xs text-gray-500 dark:text-gray-400">備註</label>
            <p className="text-theme-sm text-gray-800 dark:text-white whitespace-pre-wrap">
              {school.remarks}
            </p>
          </div>
        )}

        {selectedYearData && (
          <>
            <hr className="border-gray-200 dark:border-gray-700" />

            <div>
              <label className="text-theme-xs text-gray-500 dark:text-gray-400">
                {formatYearLabel(selectedYear)} 統計
              </label>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">課程數量</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {selectedYearData.coursesCount}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">學生人數</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {selectedYearData.totalStudents}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">總收入</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">
                  {formatCurrency(selectedYearData.totalRevenue)}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </ComponentCard>
  );
}

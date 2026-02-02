"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@/icons";
import { parsePhoneNumber } from "libphonenumber-js";
import ComponentCard from "@/components/tailadmin/common/ComponentCard";

interface SchoolBasicInfo {
  id: string;
  schoolName: string;
  schoolNameEn?: string | null;
  schoolCode?: string | null;
  address: string;
  phone?: string | null;
  fax?: string | null;
  email?: string | null;
  website?: string | null;
  remarks?: string | null;
}

interface PartnershipInfo {
  partnershipStatus: string;
  partnershipStartDate?: Date | null;
  partnershipEndDate?: Date | null;
  partnershipStartYear?: string | null;
  partnershipEndYear?: string | null;
  confirmationChannel?: string | null;
}

interface AcademicYearData {
  year: string;
  coursesCount: number;
  totalStudents: number;
  totalRevenue: number;
}

interface SchoolInfoCardsProps {
  school: SchoolBasicInfo & PartnershipInfo;
  academicYears: AcademicYearData[];
  currentYear?: string;
  onYearChange?: (year: string) => void;
}

const partnershipStatusMap: Record<string, { label: string; color: string }> = {
  INQUIRY: { label: "查詢中", color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" },
  QUOTATION_SENT: { label: "已發送報價", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  NEGOTIATING: { label: "洽談中", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  CONFIRMED: { label: "已確認合作", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  ACTIVE: { label: "合作中", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300" },
  SUSPENDED: { label: "暫停合作", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
  TERMINATED: { label: "已終止", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
};

const formatDate = (date: Date | null | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("zh-HK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("zh-HK", {
    style: "currency",
    currency: "HKD",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatPhoneNumber = (phone: string | null | undefined) => {
  if (!phone) return "-";
  try {
    const phoneNumber = parsePhoneNumber(phone);
    if (phoneNumber) {
      return phoneNumber.formatInternational();
    }
  } catch (error) {
    // 如果解析失敗，返回原始值
  }
  return phone;
};

const formatYearLabel = (year: string) => {
  if (year.includes("-")) {
    return `${year}年度`;
  }
  return `${year}年度`;
};

interface YearSelectProps {
  years: AcademicYearData[];
  selectedYear: string;
  onYearChange: (year: string) => void;
}

const YearSelect: React.FC<YearSelectProps> = ({ years, selectedYear, onYearChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = years.find((y) => y.year === selectedYear);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 items-center gap-1.5 rounded-md border border-gray-300 bg-transparent px-2.5 py-1.5 text-xs shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
      >
        <span className="text-gray-800 dark:text-white">{selectedOption ? formatYearLabel(selectedOption.year) : "選擇學年"}</span>
        <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform dark:text-gray-400 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 max-h-60 min-w-[120px] overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="py-0.5">
            {years.map((year) => (
              <div
                key={year.year}
                onClick={() => {
                  onYearChange(year.year);
                  setIsOpen(false);
                }}
                className={`cursor-pointer px-3 py-2 text-xs transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  year.year === selectedYear
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {formatYearLabel(year.year)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const SchoolInfoCards: React.FC<SchoolInfoCardsProps> = ({
  school,
  academicYears,
  currentYear,
  onYearChange,
}) => {
  const [selectedYear, setSelectedYear] = useState(currentYear || academicYears[0]?.year || "");

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    onYearChange?.(year);
  };

  const selectedYearData = academicYears.find((y) => y.year === selectedYear);
  const statusInfo = partnershipStatusMap[school.partnershipStatus] || {
    label: school.partnershipStatus,
    color: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 學校基本資料卡片 */}
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

      {/* 合作資料卡片 */}
      <ComponentCard
        title="合作資料"
        headerAction={
          academicYears.length > 0 ? (
            <YearSelect
              years={academicYears}
              selectedYear={selectedYear}
              onYearChange={handleYearChange}
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
    </div>
  );
};

export default SchoolInfoCards;

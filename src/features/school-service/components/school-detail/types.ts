export interface SchoolBasicInfo {
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

export interface PartnershipInfo {
  partnershipStatus: string;
  partnershipStartDate?: Date | null;
  partnershipEndDate?: Date | null;
  partnershipStartYear?: string | null;
  partnershipEndYear?: string | null;
  confirmationChannel?: string | null;
}

export interface AcademicYearData {
  year: string;
  coursesCount: number;
  totalStudents: number;
  totalRevenue: number;
}

export interface SchoolInfoCardsProps {
  school: SchoolBasicInfo & PartnershipInfo;
  academicYears: AcademicYearData[];
  currentYear?: string;
  onYearChange?: (year: string) => void;
}

export const PARTNERSHIP_STATUS_MAP: Record<string, { label: string; color: string }> = {
  INQUIRY: { label: "查詢中", color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" },
  QUOTATION_SENT: { label: "已發送報價", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  NEGOTIATING: { label: "洽談中", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" },
  CONFIRMED: { label: "已確認合作", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  ACTIVE: { label: "合作中", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300" },
  SUSPENDED: { label: "暫停合作", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
  TERMINATED: { label: "已終止", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
};

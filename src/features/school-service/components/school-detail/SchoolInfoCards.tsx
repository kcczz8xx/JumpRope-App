"use client";

import React, { useState } from "react";
import { SchoolInfoCardsProps } from "./types";
import SchoolBasicInfoSection from "./SchoolBasicInfoSection";
import PartnershipInfoSection from "./PartnershipInfoSection";

export default function SchoolInfoCards({
  school,
  academicYears,
  currentYear,
  onYearChange,
}: SchoolInfoCardsProps) {
  const [selectedYear, setSelectedYear] = useState(currentYear || academicYears[0]?.year || "");

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    onYearChange?.(year);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <SchoolBasicInfoSection school={school} />
      <PartnershipInfoSection
        school={school}
        academicYears={academicYears}
        selectedYear={selectedYear}
        onYearChange={handleYearChange}
      />
    </div>
  );
}

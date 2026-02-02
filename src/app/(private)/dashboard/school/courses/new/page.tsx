"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/tailadmin/common/PageBreadCrumb";
import { NewCourseForm } from "@/components/feature/school-service/course";
import { getSchoolsList } from "@/lib/mock-data/school-service/client";

interface School {
  id: string;
  schoolName: string;
}

const USE_MOCK_DATA = false;

export default function NewCoursePage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(true);

  useEffect(() => {
    async function fetchSchools() {
      if (USE_MOCK_DATA) {
        setTimeout(() => {
          setSchools(getSchoolsList());
          setIsLoadingSchools(false);
        }, 500);
        return;
      }

      try {
        const response = await fetch("/api/school-service/schools");
        if (response.ok) {
          const data = await response.json();
          setSchools(data);
        }
      } catch (error) {
        console.error("Failed to fetch schools:", error);
      } finally {
        setIsLoadingSchools(false);
      }
    }

    fetchSchools();
  }, []);

  return (
    <>
      <PageBreadcrumb pageTitle="新增課程" />
      <NewCourseForm schools={schools} isLoadingSchools={isLoadingSchools} />
    </>
  );
}

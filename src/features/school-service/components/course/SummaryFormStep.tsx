"use client";

import React from "react";
import { formatNumber, parsePhoneNumber } from "libphonenumber-js";
import FormCard from "@/components/tailadmin/form/FormCard";
import {
  NewCourseFormData,
  COURSE_TERM_LABELS,
  CHARGING_MODEL_LABELS,
  ChargingModel,
} from "../types/course";

interface SummaryFormStepProps {
  formData: NewCourseFormData;
}

function InfoRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between py-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span
        className={`text-sm font-medium ${
          highlight
            ? "text-brand-600 dark:text-brand-400"
            : "text-gray-800 dark:text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <hr className="my-2 border-gray-200 dark:border-gray-700" />;
}

export default function SummaryFormStep({ formData }: SummaryFormStepProps) {
  const { school, contact, academicYear, courses } = formData;

  const formatPhoneNumber = (phone: string) => {
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

  const renderChargingModels = (models: ChargingModel[]) => {
    if (!models || models.length === 0) return "-";
    return models.map((model) => CHARGING_MODEL_LABELS[model]).join("、");
  };

  const renderChargingFees = (course: typeof courses[0]) => {
    const fees: string[] = [];
    
    course.chargingModel.forEach((model) => {
      switch (model) {
        case ChargingModel.STUDENT_PER_LESSON:
          if (course.studentPerLessonFee) {
            fees.push(`每堂每位學生：HK$${course.studentPerLessonFee}`);
          }
          break;
        case ChargingModel.TUTOR_PER_LESSON:
          if (course.tutorPerLessonFee) {
            fees.push(`每堂導師：HK$${course.tutorPerLessonFee}`);
          }
          break;
        case ChargingModel.STUDENT_HOURLY:
          if (course.studentHourlyFee) {
            fees.push(`每小時每位學生：HK$${course.studentHourlyFee}`);
          }
          break;
        case ChargingModel.TUTOR_HOURLY:
          if (course.tutorHourlyFee) {
            fees.push(`導師時薪：HK$${course.tutorHourlyFee}`);
          }
          break;
        case ChargingModel.STUDENT_FULL_COURSE:
          if (course.studentFullCourseFee) {
            fees.push(`學生全期：HK$${course.studentFullCourseFee}`);
          }
          break;
        case ChargingModel.TEAM_ACTIVITY:
          if (course.teamActivityFee) {
            fees.push(`帶隊活動：HK$${course.teamActivityFee}`);
          }
          break;
      }
    });

    return fees.length > 0 ? fees.join("、") : "-";
  };

  return (
    <div className="space-y-6">
      <FormCard title="步驟 3：總結" description="請確認以下資料是否正確">
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          <div className="pb-4">
            <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              學校資料
            </h4>
            <InfoRow label="學校名稱" value={school.schoolName || "-"} highlight />
            {school.schoolNameEn && (
              <InfoRow label="英文名稱" value={school.schoolNameEn} />
            )}
            <InfoRow label="地址" value={school.address || "-"} />
            {school.phone && <InfoRow label="電話" value={formatPhoneNumber(school.phone)} />}
            {school.email && <InfoRow label="電郵" value={school.email} />}
            {school.website && <InfoRow label="網站" value={school.website} />}
            <InfoRow
              label="合作開始日期"
              value={school.partnershipStartDate || "-"}
            />
            {school.partnershipEndDate && (
              <InfoRow
                label="合作結束日期"
                value={school.partnershipEndDate}
              />
            )}
            <InfoRow
              label="合作學年"
              value={school.partnershipStartYear || "-"}
            />
            <InfoRow
              label="確認渠道"
              value={school.confirmationChannel || "-"}
            />
            {school.remarks && (
              <InfoRow label="備註" value={school.remarks} />
            )}
          </div>

          <div className="py-4">
            <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              聯絡人資料
            </h4>
            <InfoRow label="姓名" value={contact.nameChinese || "-"} />
            {contact.nameEnglish && (
              <InfoRow label="英文姓名" value={contact.nameEnglish} />
            )}
            {contact.position && (
              <InfoRow label="職位" value={contact.position} />
            )}
            {contact.phone && <InfoRow label="電話" value={formatPhoneNumber(contact.phone)} />}
            {contact.mobile && <InfoRow label="手提電話" value={formatPhoneNumber(contact.mobile)} />}
            {contact.email && <InfoRow label="電郵" value={contact.email} />}
          </div>

          <div className="py-4">
            <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
              課程資料
              <span className="ml-2 text-xs font-normal text-gray-400">
                (學年：{academicYear})
              </span>
            </h4>
            {courses.map((course, index) => (
              <div
                key={course.id}
                className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50"
              >
                <div className="mb-3">
                  <h5 className="font-medium text-brand-600 dark:text-brand-400">
                    課程 {index + 1}：{course.courseName || "未命名課程"}
                  </h5>
                </div>
                <div className="space-y-1 text-sm">
                  <InfoRow
                    label="課程類型"
                    value={course.courseType || "-"}
                  />
                  <InfoRow
                    label="學期"
                    value={COURSE_TERM_LABELS[course.courseTerm]}
                  />
                  {course.endDate && (
                    <InfoRow label="結束日期" value={course.endDate} />
                  )}
                  <InfoRow
                    label="所需導師"
                    value={`${course.requiredTutors} 人`}
                  />
                  {course.courseDescription && (
                    <InfoRow
                      label="課程描述"
                      value={course.courseDescription}
                    />
                  )}
                  <Divider />
                  <InfoRow
                    label="收費模式"
                    value={renderChargingModels(course.chargingModel)}
                  />
                  <InfoRow
                    label="收費金額"
                    value={renderChargingFees(course)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </FormCard>

      <div className="rounded-lg bg-brand-50 p-4 dark:bg-brand-900/20">
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 text-brand-600 dark:text-brand-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-brand-800 dark:text-brand-300">
              下一步操作
            </p>
            <p className="mt-1 text-sm text-brand-600 dark:text-brand-400">
              確認建立後，系統將創建學校資料、聯絡人資料和所有課程。您可以在課程詳情頁面進行排課和分配導師。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

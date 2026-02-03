"use client";

import { useState } from "react";

import {
  PhoneField,
  EmailField,
  ChineseNameField,
  EnglishNameField,
  CurrencyField,
  RemarksField,
  DateField,
  TimeField,
  DateRangeField,
  TimeRangeField,
  AcademicYearField,
  CourseStatusField,
  CourseTermField,
  ChargingModelField,
  LessonStatusField,
  LessonTypeField,
  InvoiceStatusField,
  PaymentMethodField,
  PartnershipStatusField,
  ContactField,
  SchoolContactField,
  AddressField,
  type FieldMode,
  type DateRangeValue,
  type TimeRangeValue,
  type ContactValue,
  type SchoolContactValue,
  type AddressValue,
} from "@/features/_core";
import {
  CourseStatus,
  CourseTerm,
  ChargingModel,
  LessonStatus,
  LessonType,
  InvoiceStatus,
  PaymentMethod,
  PartnershipStatus,
} from "@/features/_core/configs/enums";

export default function DemoPage() {
  const [mode, setMode] = useState<FieldMode>("edit");

  const [phone, setPhone] = useState("12345678");
  const [email, setEmail] = useState("test@example.com");
  const [nameChinese, setNameChinese] = useState("張三");
  const [nameEnglish, setNameEnglish] = useState("John Doe");
  const [currency, setCurrency] = useState("1000.00");
  const [remarks, setRemarks] = useState("這是一段備註文字。");

  const [date, setDate] = useState<string | null>("2024-06-15");
  const [time, setTime] = useState<string | null>("14:30");
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    startDate: "2024-09-01",
    endDate: "2025-06-30",
  });
  const [timeRange, setTimeRange] = useState<TimeRangeValue>({
    startTime: "09:00",
    endTime: "10:30",
  });
  const [academicYear, setAcademicYear] = useState("2024-2025");

  const [courseStatus, setCourseStatus] = useState<CourseStatus>(
    CourseStatus.ACTIVE
  );
  const [courseTerm, setCourseTerm] = useState<CourseTerm>(
    CourseTerm.FIRST_TERM
  );
  const [chargingModel, setChargingModel] = useState<ChargingModel>(
    ChargingModel.STUDENT_PER_LESSON
  );
  const [lessonStatus, setLessonStatus] = useState<LessonStatus>(
    LessonStatus.SCHEDULED
  );
  const [lessonType, setLessonType] = useState<LessonType>(LessonType.REGULAR);
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>(
    InvoiceStatus.SENT
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.FPS
  );
  const [partnershipStatus, setPartnershipStatus] = useState<PartnershipStatus>(
    PartnershipStatus.ACTIVE
  );

  const [contact, setContact] = useState<ContactValue>({
    name: "李四",
    phone: "98765432",
    email: "contact@school.edu.hk",
  });

  const [schoolContact, setSchoolContact] = useState<SchoolContactValue>({
    salutation: "先生",
    nameChinese: "王五",
    nameEnglish: "Wong Ng",
    position: "校長",
    phone: "23456789",
    email: "principal@school.edu.hk",
  });

  const [address, setAddress] = useState<AddressValue>({
    line1: "觀塘道123號",
    line2: "ABC大廈5樓",
    district: "觀塘",
    region: "九龍",
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">
          原子化欄位系統 Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          展示所有 24 個原子化欄位組件
        </p>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setMode("edit")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              mode === "edit"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            Edit 模式
          </button>
          <button
            onClick={() => setMode("readonly")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              mode === "readonly"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            Readonly 模式
          </button>
          <button
            onClick={() => setMode("compact")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              mode === "compact"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            Compact 模式
          </button>
        </div>

        <div className="space-y-8">
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              基礎欄位（_shared/）
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <PhoneField
                value={phone}
                onChange={setPhone}
                mode={mode}
                label="電話號碼"
                required
              />
              <EmailField
                value={email}
                onChange={setEmail}
                mode={mode}
                label="電郵地址"
                required
              />
              <ChineseNameField
                value={nameChinese}
                onChange={setNameChinese}
                mode={mode}
                label="中文姓名"
                required
              />
              <EnglishNameField
                value={nameEnglish}
                onChange={setNameEnglish}
                mode={mode}
                label="英文姓名"
              />
              <CurrencyField
                value={currency}
                onChange={setCurrency}
                mode={mode}
                label="金額"
                required
              />
              <RemarksField
                value={remarks}
                onChange={setRemarks}
                mode={mode}
                label="備註"
                maxLength={200}
                showCount
              />
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              日期時間欄位
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <DateField
                value={date}
                onChange={setDate}
                mode={mode}
                label="日期"
                required
              />
              <TimeField
                value={time}
                onChange={setTime}
                mode={mode}
                label="時間"
                step={15}
              />
              <DateRangeField
                value={dateRange}
                onChange={setDateRange}
                mode={mode}
                label="課程日期範圍"
                required
              />
              <TimeRangeField
                value={timeRange}
                onChange={setTimeRange}
                mode={mode}
                label="上課時間範圍"
                step={15}
              />
              <AcademicYearField
                value={academicYear}
                onChange={setAcademicYear}
                mode={mode}
                label="學年"
                required
              />
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              Enum 欄位（狀態/選項）
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <CourseStatusField
                value={courseStatus}
                onChange={setCourseStatus}
                mode={mode}
                label="課程狀態"
              />
              <CourseTermField
                value={courseTerm}
                onChange={setCourseTerm}
                mode={mode}
                label="課程學期"
              />
              <ChargingModelField
                value={chargingModel}
                onChange={setChargingModel}
                mode={mode}
                label="收費模式"
              />
              <LessonStatusField
                value={lessonStatus}
                onChange={setLessonStatus}
                mode={mode}
                label="課堂狀態"
              />
              <LessonTypeField
                value={lessonType}
                onChange={setLessonType}
                mode={mode}
                label="課堂類型"
              />
              <InvoiceStatusField
                value={invoiceStatus}
                onChange={setInvoiceStatus}
                mode={mode}
                label="發票狀態"
              />
              <PaymentMethodField
                value={paymentMethod}
                onChange={setPaymentMethod}
                mode={mode}
                label="付款方式"
              />
              <PartnershipStatusField
                value={partnershipStatus}
                onChange={setPartnershipStatus}
                mode={mode}
                label="合作狀態"
              />
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              複合欄位
            </h2>
            <div className="space-y-6">
              <ContactField
                value={contact}
                onChange={setContact}
                mode={mode}
                label="聯絡人"
                required
              />
              <SchoolContactField
                value={schoolContact}
                onChange={setSchoolContact}
                mode={mode}
                label="學校聯絡人"
                required
              />
              <AddressField
                value={address}
                onChange={setAddress}
                mode={mode}
                label="學校地址"
                showDistrict
                showRegion
                required
              />
            </div>
          </section>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>總計：24 個組件 | 42 個單元測試 | 5 個 Zod Schema</p>
          <p className="mt-1">
            使用方式：
            <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
              {`import { PhoneField } from "@/features/_core"`}
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}

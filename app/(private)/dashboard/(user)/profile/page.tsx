import PageBreadcrumb from "@/components/tailadmin/common/PageBreadCrumb";
import UserAddressCard from "@/components/feature/user/profile/UserAddressCard";
import UserInfoCard from "@/components/feature/user/profile/UserInfoCard";
import UserMetaCard from "@/components/feature/user/profile/UserMetaCard";
import UserBankCard from "@/components/feature/user/profile/UserBankCard";
import UserChildrenCard from "@/components/feature/user/profile/UserChildrenCard";
import UserTutorCard from "@/components/feature/user/profile/UserTutorCard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "個人資料",
  description: "個人資料",
};

const mockUserData = {
  meta: {
    name: "陳大文",
    role: "導師",
  },
  info: {
    memberNumber: "M2024-001",
    title: "先生",
    nameChinese: "陳大文",
    nameEnglish: "Chan Tai Man",
    identityCardNumber: "A123456(7)",
    gender: "男" as const,
    email: "taiman.chan@example.com",
    phone: "91234567",
    whatsappEnabled: true,
  },
  address: {
    district: "九龍",
    address: "觀塘道123號ABC大廈5樓A室",
  },
  bank: {
    bankName: "中國銀行（香港）",
    accountNumber: "012-123-456789-0",
    accountHolderName: "Chan Tai Man",
    fpsId: "91234567",
    fpsEnabled: true,
    notes: "主要收款帳戶",
  },
  children: [
    {
      id: "child_001",
      memberNumber: "M2024-002",
      nameChinese: "陳小明",
      nameEnglish: "Chan Siu Ming",
      birthYear: 2015,
      school: "香港小學",
      gender: "男" as const,
    },
    {
      id: "child_002",
      memberNumber: "M2024-003",
      nameChinese: "陳小美",
      nameEnglish: "Chan Siu Mei",
      birthYear: 2018,
      school: "九龍幼稚園",
      gender: "女" as const,
    },
  ],
  tutor: {
    sexualConvictionCheck: {
      status: "valid" as const,
      issueDate: "2024-06-15",
      expiryDate: "2027-06-14",
      documentUrl: "/documents/scrc-2024.pdf",
      referenceNumber: "SCRC-2024-12345",
    },
    firstAidCertificate: {
      status: "expiring_soon" as const,
      issueDate: "2022-03-20",
      expiryDate: "2025-03-19",
      certificateType: "標準急救證書",
      issuingBody: "香港聖約翰救護機構",
      documentUrl: "/documents/first-aid-2022.pdf",
    },
    coachingCertificates: [
      {
        id: "cert_001",
        name: "花式跳繩教練證書（一級）",
        status: "valid" as const,
        issueDate: "2023-01-10",
        expiryDate: null,
        issuingBody: "香港花式跳繩會",
        documentUrl: "/documents/coach-level1.pdf",
      },
      {
        id: "cert_002",
        name: "花式跳繩教練證書（二級）",
        status: "valid" as const,
        issueDate: "2024-05-20",
        expiryDate: null,
        issuingBody: "香港花式跳繩會",
        documentUrl: "/documents/coach-level2.pdf",
      },
    ],
    identityDocument: {
      status: "valid" as const,
      documentType: "香港身份證",
      uploadDate: "2024-01-15",
      documentUrl: "/documents/hkid.pdf",
    },
    otherCertificates: [
      {
        id: "other_001",
        name: "體適能教練證書",
        status: "expired" as const,
        issueDate: "2020-08-01",
        expiryDate: "2023-08-01",
        issuingBody: "香港體適能總會",
        documentUrl: "/documents/fitness-coach.pdf",
      },
      {
        id: "other_002",
        name: "兒童心理學證書",
        status: "valid" as const,
        issueDate: "2023-11-15",
        expiryDate: null,
        issuingBody: "香港大學專業進修學院",
        documentUrl: "/documents/child-psych.pdf",
      },
    ],
    bankInfo: {
      status: "valid" as const,
      bankName: "中國銀行（香港）",
      accountNumber: "012-123-456789-0",
      accountHolderName: "Chan Tai Man",
    },
  },
};

export default async function ProfilePage() {
  return (
    <>
      <PageBreadcrumb pageTitle="個人資料" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 lg:p-6">
        <div className="space-y-6">
          <UserMetaCard
            name={mockUserData.meta.name}
            role={mockUserData.meta.role}
          />
          <UserInfoCard
            memberNumber={mockUserData.info.memberNumber}
            title={mockUserData.info.title}
            nameChinese={mockUserData.info.nameChinese}
            nameEnglish={mockUserData.info.nameEnglish}
            identityCardNumber={mockUserData.info.identityCardNumber}
            gender={mockUserData.info.gender}
            email={mockUserData.info.email}
            phone={mockUserData.info.phone}
            whatsappEnabled={mockUserData.info.whatsappEnabled}
          />
          <UserAddressCard
            district={mockUserData.address.district}
            address={mockUserData.address.address}
          />
          <UserBankCard
            bankName={mockUserData.bank.bankName}
            accountNumber={mockUserData.bank.accountNumber}
            accountHolderName={mockUserData.bank.accountHolderName}
            fpsId={mockUserData.bank.fpsId}
            fpsEnabled={mockUserData.bank.fpsEnabled}
            notes={mockUserData.bank.notes}
          />
          <UserChildrenCard children={mockUserData.children} />
          <UserTutorCard
            sexualConvictionCheck={mockUserData.tutor.sexualConvictionCheck}
            firstAidCertificate={mockUserData.tutor.firstAidCertificate}
            coachingCertificates={mockUserData.tutor.coachingCertificates}
            identityDocument={mockUserData.tutor.identityDocument}
            otherCertificates={mockUserData.tutor.otherCertificates}
            bankInfo={mockUserData.tutor.bankInfo}
          />
        </div>
      </div>
    </>
  );
}

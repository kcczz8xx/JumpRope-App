"use client";
import React from "react";
import { usePermission } from "@/hooks/usePermission";
import UserMetaCard from "./UserMetaCard";
import UserInfoCard from "./UserInfoCard";
import UserAddressCard from "./UserAddressCard";
import UserBankCard from "./UserBankCard";
import UserChildrenCard from "./UserChildrenCard";
import UserTutorCard from "./UserTutorCard";
import type {
  SexualConvictionCheck,
  FirstAidCertificate,
  IdentityDocument,
  CoachingCertificate,
  OtherCertificate,
  BankDocument,
  AddressProof,
} from "./tutor-documents/types";

interface ProfilePageContentProps {
  initialData: {
    meta: { name: string; role: string };
    info: {
      memberNumber?: string;
      nickname?: string;
      title?: string;
      nameChinese?: string;
      nameEnglish?: string;
      identityCardNumber?: string;
      gender?: string;
      email?: string;
      phone?: string;
      whatsappEnabled?: boolean;
    };
    address: { region?: string; district?: string; address?: string };
    bank?: {
      bankName?: string;
      accountNumber?: string;
      accountHolderName?: string;
      fpsId?: string;
      fpsEnabled?: boolean;
      notes?: string;
    };
    children?: {
      id: string;
      memberNumber?: string | null;
      nameChinese: string;
      nameEnglish?: string | null;
      birthYear?: number | null;
      school?: string | null;
      gender?: "MALE" | "FEMALE" | null;
    }[];
    tutor?: {
      sexualConvictionCheck?: SexualConvictionCheck;
      firstAidCertificate?: FirstAidCertificate;
      identityDocument?: IdentityDocument;
      coachingCertificates?: CoachingCertificate[];
      otherCertificates?: OtherCertificate[];
      bankDocument?: BankDocument;
      addressProof?: AddressProof;
    };
  };
}

const GENDER_MAP: Record<string, "男" | "女" | ""> = {
  MALE: "男",
  FEMALE: "女",
};

export default function ProfilePageContent({
  initialData,
}: ProfilePageContentProps) {
  const { can } = usePermission();

  const info = {
    memberNumber: initialData.info.memberNumber,
    nickname: initialData.info.nickname,
    title: initialData.info.title,
    nameChinese: initialData.info.nameChinese,
    nameEnglish: initialData.info.nameEnglish,
    identityCardNumber: initialData.info.identityCardNumber,
    gender: initialData.info.gender
      ? GENDER_MAP[initialData.info.gender]
      : undefined,
    email: initialData.info.email,
    phone: initialData.info.phone,
    whatsappEnabled: initialData.info.whatsappEnabled,
  };

  const address = initialData.address;
  const bank = initialData.bank;

  return (
    <div className="space-y-6">
      <UserMetaCard name={initialData.meta.name} role={initialData.meta.role} />
      <UserInfoCard
        memberNumber={info.memberNumber}
        nickname={info.nickname}
        title={info.title}
        nameChinese={info.nameChinese}
        nameEnglish={info.nameEnglish}
        identityCardNumber={info.identityCardNumber}
        gender={info.gender as "男" | "女" | ""}
        email={info.email}
        phone={info.phone}
        whatsappEnabled={info.whatsappEnabled}
      />
      <UserAddressCard
        region={address.region}
        district={address.district}
        address={address.address}
      />
      {(bank || initialData.bank) && (
        <UserBankCard
          bankName={bank?.bankName}
          accountNumber={bank?.accountNumber}
          accountHolderName={bank?.accountHolderName}
          fpsId={bank?.fpsId}
          fpsEnabled={bank?.fpsEnabled}
          notes={bank?.notes}
        />
      )}
      {can("CHILD_READ_OWN") && (
        <UserChildrenCard initialChildren={initialData.children} />
      )}
      {initialData.tutor && (
        <UserTutorCard
          identityDocument={initialData.tutor.identityDocument}
          sexualConvictionCheck={initialData.tutor.sexualConvictionCheck}
          bankDocument={initialData.tutor.bankDocument}
          addressProof={initialData.tutor.addressProof}
          firstAidCertificate={initialData.tutor.firstAidCertificate}
          coachingCertificates={initialData.tutor.coachingCertificates}
          otherCertificates={initialData.tutor.otherCertificates}
        />
      )}
    </div>
  );
}

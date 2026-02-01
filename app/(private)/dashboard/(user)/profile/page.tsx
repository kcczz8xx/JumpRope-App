import PageBreadcrumb from "@/components/tailadmin/common/PageBreadCrumb";
import UserAddressCard from "@/components/feature/user/profile/UserAddressCard";
import UserInfoCard from "@/components/feature/user/profile/UserInfoCard";
import UserMetaCard from "@/components/feature/user/profile/UserMetaCard";
import UserBankCard from "@/components/feature/user/profile/UserBankCard";
import UserChildrenCard from "@/components/feature/user/profile/UserChildrenCard";
import UserTutorCard from "@/components/feature/user/profile/UserTutorCard";
import { Metadata } from "next";
import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/user";

export const metadata: Metadata = {
  title: "個人資料",
  description: "個人資料",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  const userData = await getUserProfile(session.user.id);

  if (!userData) {
    redirect("/signin");
  }

  return (
    <>
      <PageBreadcrumb pageTitle="個人資料" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 lg:p-6">
        <div className="space-y-6">
          <UserMetaCard name={userData.meta.name} role={userData.meta.role} />
          <UserInfoCard
            memberNumber={userData.info.memberNumber}
            nickname={userData.info.nickname}
            title={userData.info.title}
            nameChinese={userData.info.nameChinese}
            nameEnglish={userData.info.nameEnglish}
            identityCardNumber={userData.info.identityCardNumber}
            gender={userData.info.gender as "男" | "女" | ""}
            email={userData.info.email}
            phone={userData.info.phone}
            whatsappEnabled={userData.info.whatsappEnabled}
          />
          <UserAddressCard
            district={userData.address.district}
            address={userData.address.address}
          />
          {userData.bank && (
            <UserBankCard
              bankName={userData.bank.bankName}
              accountNumber={userData.bank.accountNumber}
              accountHolderName={userData.bank.accountHolderName}
              fpsId={userData.bank.fpsId}
              fpsEnabled={userData.bank.fpsEnabled}
              notes={userData.bank.notes}
            />
          )}
          {userData.children && (
            <UserChildrenCard
              children={
                userData.children as {
                  id: string;
                  memberNumber?: string;
                  nameChinese: string;
                  nameEnglish?: string;
                  birthYear?: number;
                  school?: string;
                  gender?: "男" | "女";
                }[]
              }
            />
          )}
          {userData.tutor && (
            <UserTutorCard
              sexualConvictionCheck={userData.tutor.sexualConvictionCheck}
              firstAidCertificate={userData.tutor.firstAidCertificate}
              identityDocument={userData.tutor.identityDocument}
              coachingCertificates={userData.tutor.coachingCertificates}
              otherCertificates={userData.tutor.otherCertificates}
              bankInfo={userData.tutor.bankInfo}
            />
          )}
        </div>
      </div>
    </>
  );
}

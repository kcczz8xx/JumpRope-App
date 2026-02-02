import PageBreadcrumb from "@/components/tailadmin/common/PageBreadCrumb";
import ProfilePageContent from "@/features/user/components/profile/ProfilePageContent";
import { Metadata } from "next";
import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/services";

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
        <ProfilePageContent
          initialData={{
            meta: userData.meta,
            info: {
              memberNumber: userData.info.memberNumber,
              nickname: userData.info.nickname,
              title: userData.info.title,
              nameChinese: userData.info.nameChinese,
              nameEnglish: userData.info.nameEnglish,
              identityCardNumber: userData.info.identityCardNumber,
              gender: userData.info.gender,
              email: userData.info.email,
              phone: userData.info.phone,
              whatsappEnabled: userData.info.whatsappEnabled,
            },
            address: userData.address,
            bank: userData.bank || undefined,
            children: userData.children as {
              id: string;
              memberNumber?: string | null;
              nameChinese: string;
              nameEnglish?: string | null;
              birthYear?: number | null;
              school?: string | null;
              gender?: "MALE" | "FEMALE" | null;
            }[],
            tutor: userData.tutor || undefined,
          }}
        />
      </div>
    </>
  );
}

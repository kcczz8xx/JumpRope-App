"use client";
import React, { useState } from "react";
import Badge from "@/components/tailadmin/ui/badge/Badge";

type DocumentStatus =
  | "valid"
  | "expired"
  | "expiring_soon"
  | "pending"
  | "not_submitted";

interface SexualConvictionCheck {
  status: DocumentStatus;
  issueDate?: string;
  expiryDate?: string;
  documentUrl?: string;
  referenceNumber?: string;
}

interface FirstAidCertificate {
  status: DocumentStatus;
  issueDate?: string;
  expiryDate?: string;
  certificateType?: string;
  issuingBody?: string;
  documentUrl?: string;
}

interface CoachingCertificate {
  id: string;
  name: string;
  status: DocumentStatus;
  issueDate?: string;
  expiryDate?: string | null;
  issuingBody?: string;
  documentUrl?: string;
}

interface IdentityDocument {
  status: DocumentStatus;
  documentType?: string;
  uploadDate?: string;
  documentUrl?: string;
}

interface OtherCertificate {
  id: string;
  name: string;
  status: DocumentStatus;
  issueDate?: string;
  expiryDate?: string | null;
  issuingBody?: string;
  documentUrl?: string;
}

interface BankInfo {
  status: DocumentStatus;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
}

interface UserTutorCardProps {
  sexualConvictionCheck?: SexualConvictionCheck;
  firstAidCertificate?: FirstAidCertificate;
  coachingCertificates?: CoachingCertificate[];
  identityDocument?: IdentityDocument;
  otherCertificates?: OtherCertificate[];
  bankInfo?: BankInfo;
  onAddSexualConvictionCheck?: () => void;
  onAddFirstAidCertificate?: () => void;
  onAddIdentityDocument?: () => void;
  onAddBankInfo?: () => void;
  onAddCoachingCertificate?: () => void;
  onAddOtherCertificate?: () => void;
}

type TabType = "required" | "coaching" | "other";

const STATUS_BADGE_COLOR: Record<
  DocumentStatus,
  "success" | "warning" | "error" | "info" | "light"
> = {
  valid: "success",
  expiring_soon: "warning",
  expired: "error",
  pending: "info",
  not_submitted: "light",
};

const STATUS_LABEL: Record<DocumentStatus, string> = {
  valid: "有效",
  expiring_soon: "即將過期",
  expired: "已過期",
  pending: "審核中",
  not_submitted: "未提交",
};

function formatDate(dateString?: string | null): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-HK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const ViewIcon = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const DownloadIcon = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

const AddIcon = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

function AddButton({
  onClick,
  label,
}: {
  onClick?: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-sm font-medium text-brand-500 hover:text-brand-600 transition dark:text-brand-400 dark:hover:text-brand-300"
    >
      <AddIcon />
      {label}
    </button>
  );
}

function DocumentActions({
  documentUrl,
  showAddButton,
  onAdd,
}: {
  documentUrl?: string;
  showAddButton?: boolean;
  onAdd?: () => void;
}) {
  if (showAddButton) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-1.5 text-xs font-medium text-brand-500 bg-transparent ring-1 ring-inset ring-brand-500 rounded-md hover:bg-brand-500 hover:text-white transition dark:text-brand-400 dark:ring-brand-400 dark:hover:bg-brand-500 dark:hover:text-white"
      >
        <AddIcon />
        新增資料
      </button>
    );
  }

  if (!documentUrl) return null;

  const handleView = () => {
    window.open(documentUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = documentUrl;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="inline-flex items-center">
      <button
        type="button"
        onClick={handleView}
        className="inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-1.5 text-xs font-medium text-brand-500 bg-transparent ring-1 ring-inset ring-brand-500 rounded-l-md hover:bg-brand-500 hover:text-white transition dark:text-brand-400 dark:ring-brand-400 dark:hover:bg-brand-500 dark:hover:text-white"
      >
        <ViewIcon />
        查看
      </button>
      <button
        type="button"
        onClick={handleDownload}
        className="-ml-px inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-1.5 text-xs font-medium text-brand-500 bg-transparent ring-1 ring-inset ring-brand-500 rounded-r-md hover:bg-brand-500 hover:text-white transition dark:text-brand-400 dark:ring-brand-400 dark:hover:bg-brand-500 dark:hover:text-white"
      >
        <DownloadIcon />
        下載
      </button>
    </div>
  );
}

interface DocumentRowData {
  id?: string;
  name: string;
  status: DocumentStatus;
  issuingBody?: string;
  issueDate?: string;
  expiryDate?: string | null;
  documentUrl?: string;
  onAdd?: () => void;
}

function DocumentTable({
  documents,
  showActions = true,
  showAddButtonAtBottom = false,
  onAddNew,
  addButtonLabel = "新增證書",
}: {
  documents: DocumentRowData[];
  showActions?: boolean;
  showAddButtonAtBottom?: boolean;
  onAddNew?: () => void;
  addButtonLabel?: string;
}) {
  if (documents.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>暫無資料</p>
        {showAddButtonAtBottom && (
          <button
            type="button"
            onClick={onAddNew}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-brand-500 bg-transparent ring-1 ring-inset ring-brand-500 rounded-md hover:bg-brand-500 hover:text-white transition dark:text-brand-400 dark:ring-brand-400 dark:hover:bg-brand-500 dark:hover:text-white"
          >
            <AddIcon />
            {addButtonLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="custom-scrollbar overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-900">
            <th className="px-6 py-4 text-left text-sm font-medium whitespace-nowrap text-gray-500 dark:text-gray-400">
              名稱
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium whitespace-nowrap text-gray-500 dark:text-gray-400">
              狀態
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium whitespace-nowrap text-gray-500 dark:text-gray-400">
              簽發機構
            </th>
            <th className="px-6 py-4 text-left text-sm font-medium whitespace-nowrap text-gray-500 dark:text-gray-400">
              到期日期
            </th>
            {showActions && (
              <th className="px-6 py-4 text-left text-sm font-medium whitespace-nowrap text-gray-500 dark:text-gray-400">
                {showAddButtonAtBottom ? (
                  <AddButton onClick={onAddNew} label={addButtonLabel} />
                ) : (
                  "操作"
                )}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {documents.map((doc, index) => (
            <tr key={doc.id || index}>
              <td className="px-6 py-4 text-left text-sm whitespace-nowrap text-gray-700 dark:text-gray-400">
                {doc.name}
              </td>
              <td className="px-6 py-4 text-left whitespace-nowrap">
                <Badge size="sm" color={STATUS_BADGE_COLOR[doc.status]}>
                  {STATUS_LABEL[doc.status]}
                </Badge>
                {doc.status === "expiring_soon" && (
                  <span className="ml-1 text-xs text-warning-600 dark:text-warning-400">
                    (30天內)
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-left text-sm whitespace-nowrap text-gray-700 dark:text-gray-400">
                {doc.issuingBody || "-"}
              </td>
              <td className="px-6 py-4 text-left text-sm whitespace-nowrap text-gray-700 dark:text-gray-400">
                {doc.expiryDate === null
                  ? "永久有效"
                  : formatDate(doc.expiryDate)}
              </td>
              {showActions && (
                <td className="px-6 py-4 text-left whitespace-nowrap">
                  <DocumentActions
                    documentUrl={doc.documentUrl}
                    showAddButton={doc.status === "not_submitted"}
                    onAdd={doc.onAdd}
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function UserTutorCard({
  sexualConvictionCheck,
  firstAidCertificate,
  coachingCertificates = [],
  identityDocument,
  otherCertificates = [],
  bankInfo,
  onAddSexualConvictionCheck,
  onAddFirstAidCertificate,
  onAddIdentityDocument,
  onAddBankInfo,
  onAddCoachingCertificate,
  onAddOtherCertificate,
}: UserTutorCardProps) {
  const [selectedTab, setSelectedTab] = useState<TabType>("required");

  const requiredDocuments: DocumentRowData[] = [];

  requiredDocuments.push({
    id: "scrc",
    name: "性罪行定罪紀錄查核",
    status: sexualConvictionCheck?.status || "not_submitted",
    issuingBody: sexualConvictionCheck?.referenceNumber
      ? `參考編號: ${sexualConvictionCheck.referenceNumber}`
      : "-",
    expiryDate: sexualConvictionCheck?.expiryDate,
    documentUrl: sexualConvictionCheck?.documentUrl,
    onAdd: onAddSexualConvictionCheck,
  });

  requiredDocuments.push({
    id: "first-aid",
    name: firstAidCertificate?.certificateType || "急救證書",
    status: firstAidCertificate?.status || "not_submitted",
    issuingBody: firstAidCertificate?.issuingBody || "-",
    expiryDate: firstAidCertificate?.expiryDate,
    documentUrl: firstAidCertificate?.documentUrl,
    onAdd: onAddFirstAidCertificate,
  });

  requiredDocuments.push({
    id: "identity",
    name: identityDocument?.documentType || "身份證明文件",
    status: identityDocument?.status || "not_submitted",
    issuingBody: identityDocument?.uploadDate
      ? `上傳於 ${formatDate(identityDocument.uploadDate)}`
      : "-",
    expiryDate: null,
    documentUrl: undefined,
    onAdd: onAddIdentityDocument,
  });

  requiredDocuments.push({
    id: "bank",
    name: "銀行資料",
    status: bankInfo?.status || "not_submitted",
    issuingBody: bankInfo?.bankName
      ? `${bankInfo.bankName} - ${bankInfo.accountHolderName || ""}`
      : "-",
    expiryDate: null,
    documentUrl: undefined,
    onAdd: onAddBankInfo,
  });

  const coachingDocs: DocumentRowData[] = coachingCertificates.map((cert) => ({
    id: cert.id,
    name: cert.name,
    status: cert.status,
    issuingBody: cert.issuingBody,
    expiryDate: cert.expiryDate,
    documentUrl: cert.documentUrl,
  }));

  const otherDocs: DocumentRowData[] = otherCertificates.map((cert) => ({
    id: cert.id,
    name: cert.name,
    status: cert.status,
    issuingBody: cert.issuingBody,
    expiryDate: cert.expiryDate,
    documentUrl: cert.documentUrl,
  }));

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: "required", label: "必要文件", count: requiredDocuments.length },
    { key: "coaching", label: "教練證書", count: coachingDocs.length },
    { key: "other", label: "其他證書", count: otherDocs.length },
  ];

  const getCurrentDocuments = () => {
    switch (selectedTab) {
      case "required":
        return requiredDocuments;
      case "coaching":
        return coachingDocs;
      case "other":
        return otherDocs;
      default:
        return [];
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800/50">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          導師資料
        </h4>
      </div>

      <div className="px-6 py-4">
        <div className="flex w-full items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`text-sm w-full rounded-md px-3 py-2 font-medium hover:text-gray-900 dark:hover:text-white ${
                selectedTab === tab.key
                  ? "shadow-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <DocumentTable
        documents={getCurrentDocuments()}
        showActions={true}
        showAddButtonAtBottom={
          selectedTab === "coaching" || selectedTab === "other"
        }
        onAddNew={
          selectedTab === "coaching"
            ? onAddCoachingCertificate
            : onAddOtherCertificate
        }
        addButtonLabel={
          selectedTab === "coaching" ? "新增教練證書" : "新增其他證書"
        }
      />
    </div>
  );
}

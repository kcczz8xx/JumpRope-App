"use client";
import React from "react";
import Badge from "@/components/tailadmin/ui/badge/Badge";
import {
  DocumentRowData,
  DocumentStatus,
  STATUS_BADGE_COLOR,
  STATUS_LABEL,
  formatDate,
} from "./types";

interface DocumentTableProps {
  documents: DocumentRowData[];
  showActions?: boolean;
  showAddButtonAtBottom?: boolean;
  onAddNew?: () => void;
  addButtonLabel?: string;
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

export default function DocumentTable({
  documents,
  showActions = true,
  showAddButtonAtBottom = false,
  onAddNew,
  addButtonLabel = "新增證書",
}: DocumentTableProps) {
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

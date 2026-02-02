"use client";
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/hooks/useModal";
import {
  createTutorDocumentAction,
  updateTutorDocumentAction,
  deleteTutorDocumentAction,
} from "@/features/user";
import DocumentTable from "./tutor-documents/DocumentTable";
import TutorDocumentEditModal from "./tutor-documents/TutorDocumentEditModal";
import {
  DocumentType,
  TutorDocumentFormData,
  DocumentRowData,
  SexualConvictionCheck,
  FirstAidCertificate,
  CoachingCertificate,
  IdentityDocument,
  OtherCertificate,
  BankDocument,
  AddressProof,
  formatDate,
} from "./tutor-documents/types";

type TabType = "required" | "coaching" | "other";

interface UserTutorCardProps {
  identityDocument?: IdentityDocument;
  sexualConvictionCheck?: SexualConvictionCheck;
  bankDocument?: BankDocument;
  addressProof?: AddressProof;
  firstAidCertificate?: FirstAidCertificate;
  coachingCertificates?: CoachingCertificate[];
  otherCertificates?: OtherCertificate[];
}

export default function UserTutorCard({
  identityDocument,
  sexualConvictionCheck,
  bankDocument,
  addressProof,
  firstAidCertificate,
  coachingCertificates = [],
  otherCertificates = [],
}: UserTutorCardProps) {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<TabType>("required");
  const [isPending, startTransition] = useTransition();

  // Modal states for each document type
  const identityModal = useModal();
  const sexualConvictionModal = useModal();
  const bankDocumentModal = useModal();
  const addressProofModal = useModal();
  const firstAidModal = useModal();
  const coachingModal = useModal();
  const otherModal = useModal();

  // Current editing document (for edit mode)
  const [editingDocument, setEditingDocument] = useState<{
    id?: string;
    type: DocumentType;
    data?: Partial<TutorDocumentFormData>;
  } | null>(null);

  // Open modal for adding new document
  const handleAddDocument = (type: DocumentType) => {
    setEditingDocument({ type });
    switch (type) {
      case "IDENTITY_DOCUMENT":
        identityModal.openModal();
        break;
      case "SEXUAL_CONVICTION_CHECK":
        sexualConvictionModal.openModal();
        break;
      case "BANK_DOCUMENT":
        bankDocumentModal.openModal();
        break;
      case "ADDRESS_PROOF":
        addressProofModal.openModal();
        break;
      case "FIRST_AID_CERTIFICATE":
        firstAidModal.openModal();
        break;
      case "COACHING_CERTIFICATE":
        coachingModal.openModal();
        break;
      case "OTHER_CERTIFICATE":
        otherModal.openModal();
        break;
    }
  };

  // Close all modals
  const closeAllModals = () => {
    identityModal.closeModal();
    sexualConvictionModal.closeModal();
    bankDocumentModal.closeModal();
    addressProofModal.closeModal();
    firstAidModal.closeModal();
    coachingModal.closeModal();
    otherModal.closeModal();
    setEditingDocument(null);
  };

  // Save document (create or update)
  const handleSaveDocument = async (
    data: TutorDocumentFormData,
    file?: File
  ) => {
    const formData = new FormData();

    if (editingDocument?.id) {
      formData.append("documentId", editingDocument.id);
    }

    formData.append("documentType", data.documentType);
    formData.append("name", data.name);

    if (data.referenceNumber) {
      formData.append("referenceNumber", data.referenceNumber);
    }
    if (data.certificateType) {
      formData.append("certificateType", data.certificateType);
    }
    if (data.issuingBody) {
      formData.append("issuingBody", data.issuingBody);
    }
    if (data.issueDate) {
      formData.append("issueDate", data.issueDate);
    }
    if (data.expiryDate !== undefined) {
      formData.append("expiryDate", data.expiryDate || "");
    }
    if (data.notes) {
      formData.append("notes", data.notes);
    }
    if (file) {
      formData.append("file", file);
    }

    const result = editingDocument?.id
      ? await updateTutorDocumentAction(formData)
      : await createTutorDocumentAction(formData);

    if (!result.success) {
      throw new Error(result.error.message);
    }

    closeAllModals();
    router.refresh();
  };

  // Delete document
  const handleDeleteDocument = async (documentId: string) => {
    const result = await deleteTutorDocumentAction(documentId);

    if (!result.success) {
      throw new Error(result.error.message);
    }

    closeAllModals();
    router.refresh();
  };

  // Build required documents list
  const requiredDocuments: DocumentRowData[] = [
    // 1. 香港身份證（必須）
    {
      id: "identity",
      name: "香港身份證",
      status: identityDocument?.status || "not_submitted",
      issuingBody: identityDocument?.uploadDate
        ? `上傳於 ${formatDate(identityDocument.uploadDate)}`
        : "-",
      expiryDate: null,
      documentUrl: identityDocument?.documentUrl,
      onAdd: () => handleAddDocument("IDENTITY_DOCUMENT"),
    },
    // 2. 性罪行定罪紀錄查核（必須）
    {
      id: "scrc",
      name: "性罪行定罪紀錄查核",
      status: sexualConvictionCheck?.status || "not_submitted",
      issuingBody: sexualConvictionCheck?.referenceNumber
        ? `參考編號: ${sexualConvictionCheck.referenceNumber}`
        : "-",
      expiryDate: sexualConvictionCheck?.expiryDate,
      documentUrl: sexualConvictionCheck?.documentUrl,
      onAdd: () => handleAddDocument("SEXUAL_CONVICTION_CHECK"),
    },
    // 3. 銀行資料文件（月結單/銀行卡）
    {
      id: "bank-doc",
      name: bankDocument?.documentType || "銀行資料文件",
      status: bankDocument?.status || "not_submitted",
      issuingBody: bankDocument?.bankName || "-",
      expiryDate: null,
      documentUrl: bankDocument?.documentUrl,
      onAdd: () => handleAddDocument("BANK_DOCUMENT"),
    },
    // 5. 住址證明（郵寄支票/文件用）
    {
      id: "address-proof",
      name: addressProof?.documentType || "住址證明",
      status: addressProof?.status || "not_submitted",
      issuingBody: addressProof?.issueDate
        ? `簽發於 ${formatDate(addressProof.issueDate)}`
        : "-",
      expiryDate: null,
      documentUrl: addressProof?.documentUrl,
      onAdd: () => handleAddDocument("ADDRESS_PROOF"),
    },
    // 6. 急救證書（可選）
    {
      id: "first-aid",
      name: firstAidCertificate?.certificateType || "急救證書",
      status: firstAidCertificate?.status || "not_submitted",
      issuingBody: firstAidCertificate?.issuingBody || "-",
      expiryDate: firstAidCertificate?.expiryDate,
      documentUrl: firstAidCertificate?.documentUrl,
      onAdd: () => handleAddDocument("FIRST_AID_CERTIFICATE"),
    },
  ];

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
            ? () => handleAddDocument("COACHING_CERTIFICATE")
            : () => handleAddDocument("OTHER_CERTIFICATE")
        }
        addButtonLabel={
          selectedTab === "coaching" ? "新增教練證書" : "新增其他證書"
        }
      />

      {/* 1. Identity Document Modal */}
      <TutorDocumentEditModal
        isOpen={identityModal.isOpen}
        onClose={closeAllModals}
        onSave={handleSaveDocument}
        onDelete={
          editingDocument?.id
            ? () => handleDeleteDocument(editingDocument.id!)
            : undefined
        }
        documentType="IDENTITY_DOCUMENT"
        initialData={{
          name: "香港身份證",
          existingDocumentUrl: identityDocument?.documentUrl,
          ...editingDocument?.data,
        }}
        isLoading={isPending}
        hasExistingData={!!identityDocument?.documentUrl}
      />

      {/* 2. Sexual Conviction Check Modal */}
      <TutorDocumentEditModal
        isOpen={sexualConvictionModal.isOpen}
        onClose={closeAllModals}
        onSave={handleSaveDocument}
        onDelete={
          editingDocument?.id
            ? () => handleDeleteDocument(editingDocument.id!)
            : undefined
        }
        documentType="SEXUAL_CONVICTION_CHECK"
        initialData={{
          name: "性罪行定罪紀錄查核",
          referenceNumber: sexualConvictionCheck?.referenceNumber,
          issueDate: sexualConvictionCheck?.issueDate,
          expiryDate: sexualConvictionCheck?.expiryDate,
          existingDocumentUrl: sexualConvictionCheck?.documentUrl,
          ...editingDocument?.data,
        }}
        isLoading={isPending}
        hasExistingData={!!sexualConvictionCheck?.documentUrl}
      />

      {/* 3. Bank Document Modal */}
      <TutorDocumentEditModal
        isOpen={bankDocumentModal.isOpen}
        onClose={closeAllModals}
        onSave={handleSaveDocument}
        onDelete={
          editingDocument?.id
            ? () => handleDeleteDocument(editingDocument.id!)
            : undefined
        }
        documentType="BANK_DOCUMENT"
        initialData={{
          name: bankDocument?.documentType || "",
          issuingBody: bankDocument?.bankName,
          issueDate: bankDocument?.issueDate,
          existingDocumentUrl: bankDocument?.documentUrl,
          ...editingDocument?.data,
        }}
        isLoading={isPending}
        hasExistingData={!!bankDocument?.documentUrl}
      />

      {/* 4. Address Proof Modal */}
      <TutorDocumentEditModal
        isOpen={addressProofModal.isOpen}
        onClose={closeAllModals}
        onSave={handleSaveDocument}
        onDelete={
          editingDocument?.id
            ? () => handleDeleteDocument(editingDocument.id!)
            : undefined
        }
        documentType="ADDRESS_PROOF"
        initialData={{
          name: addressProof?.documentType || "",
          issueDate: addressProof?.issueDate,
          existingDocumentUrl: addressProof?.documentUrl,
          ...editingDocument?.data,
        }}
        isLoading={isPending}
        hasExistingData={!!addressProof?.documentUrl}
      />

      {/* 5. First Aid Certificate Modal */}
      <TutorDocumentEditModal
        isOpen={firstAidModal.isOpen}
        onClose={closeAllModals}
        onSave={handleSaveDocument}
        onDelete={
          editingDocument?.id
            ? () => handleDeleteDocument(editingDocument.id!)
            : undefined
        }
        documentType="FIRST_AID_CERTIFICATE"
        initialData={{
          name: firstAidCertificate?.certificateType || "急救證書",
          certificateType: firstAidCertificate?.certificateType,
          issuingBody: firstAidCertificate?.issuingBody,
          issueDate: firstAidCertificate?.issueDate,
          expiryDate: firstAidCertificate?.expiryDate,
          existingDocumentUrl: firstAidCertificate?.documentUrl,
          ...editingDocument?.data,
        }}
        isLoading={isPending}
        hasExistingData={!!firstAidCertificate?.documentUrl}
      />

      {/* 6. Coaching Certificate Modal */}
      <TutorDocumentEditModal
        isOpen={coachingModal.isOpen}
        onClose={closeAllModals}
        onSave={handleSaveDocument}
        onDelete={
          editingDocument?.id
            ? () => handleDeleteDocument(editingDocument.id!)
            : undefined
        }
        documentType="COACHING_CERTIFICATE"
        initialData={editingDocument?.data}
        isLoading={isPending}
        hasExistingData={!!editingDocument?.id}
      />

      {/* 7. Other Certificate Modal */}
      <TutorDocumentEditModal
        isOpen={otherModal.isOpen}
        onClose={closeAllModals}
        onSave={handleSaveDocument}
        onDelete={
          editingDocument?.id
            ? () => handleDeleteDocument(editingDocument.id!)
            : undefined
        }
        documentType="OTHER_CERTIFICATE"
        initialData={editingDocument?.data}
        isLoading={isPending}
        hasExistingData={!!editingDocument?.id}
      />
    </div>
  );
}

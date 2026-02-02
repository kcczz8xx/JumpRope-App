"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/tailadmin/ui/modal";
import Label from "@/components/tailadmin/form/Label";
import Input from "@/components/tailadmin/form/input/InputField";
import SearchableSelect from "@/components/tailadmin/form/select/SearchableSelect";
import TextArea from "@/components/tailadmin/form/input/TextArea";
import Button from "@/components/tailadmin/ui/button/Button";
import Switch from "@/components/tailadmin/form/switch/Switch";
import FileUploadArea from "./FileUploadArea";
import {
  DocumentType,
  TutorDocumentFormData,
  DOCUMENT_TYPE_CONFIG,
  FIRST_AID_CERTIFICATE_TYPES,
  FIRST_AID_ISSUING_BODIES,
  BANK_DOCUMENT_TYPES,
  ADDRESS_PROOF_TYPES,
  getDefaultName,
} from "./types";

interface TutorDocumentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TutorDocumentFormData, file?: File) => void;
  onDelete?: () => void;
  documentType: DocumentType;
  initialData?: Partial<TutorDocumentFormData>;
  isLoading?: boolean;
  hasExistingData?: boolean;
}

export default function TutorDocumentEditModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  documentType,
  initialData = {},
  isLoading = false,
  hasExistingData = false,
}: TutorDocumentEditModalProps) {
  const config = DOCUMENT_TYPE_CONFIG[documentType];

  const [formData, setFormData] = useState<TutorDocumentFormData>({
    documentType,
    name: "",
    referenceNumber: "",
    certificateType: "",
    issuingBody: "",
    issueDate: "",
    expiryDate: "",
    isPermanent: false,
    file: null,
    existingDocumentUrl: "",
    notes: "",
  });

  const [fileError, setFileError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setFormData({
        documentType,
        name: initialData.name || getDefaultName(documentType),
        referenceNumber: initialData.referenceNumber || "",
        certificateType: initialData.certificateType || "",
        issuingBody: initialData.issuingBody || "",
        issueDate: initialData.issueDate || "",
        expiryDate: initialData.expiryDate || "",
        isPermanent: initialData.expiryDate === null,
        file: null,
        existingDocumentUrl: initialData.existingDocumentUrl || "",
        notes: initialData.notes || "",
      });
      setFileError("");
    }
  }, [isOpen, initialData, documentType]);

  const handleChange = (
    field: keyof TutorDocumentFormData,
    value: string | boolean | File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "isPermanent" && value === true) {
      setFormData((prev) => ({ ...prev, expiryDate: "" }));
    }
  };

  const handleSave = () => {
    const submitData: TutorDocumentFormData = {
      ...formData,
      expiryDate: formData.isPermanent ? null : formData.expiryDate,
    };
    onSave(submitData, formData.file || undefined);
  };

  const isFormValid = (): boolean => {
    if (!formData.name.trim()) return false;

    if (config.showReferenceNumber && !formData.referenceNumber?.trim()) {
      return false;
    }

    if (config.showCertificateType && !formData.certificateType?.trim()) {
      return false;
    }

    if (config.showIssuingBody && !formData.issuingBody?.trim()) {
      return false;
    }

    if (!hasExistingData && !formData.file) {
      return false;
    }

    return true;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[600px] p-5 lg:p-8"
    >
      <div>
        <h4 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
          {hasExistingData ? "編輯" : "新增"}
          {config.title}
        </h4>

        <div className="space-y-5">
          {/* Description */}
          {config.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">
              {config.description}
            </p>
          )}

          {/* Document Name */}
          <div>
            <Label>{config.nameLabel}</Label>
            {config.nameEditable ? (
              documentType === "BANK_DOCUMENT" ? (
                <SearchableSelect
                  options={BANK_DOCUMENT_TYPES}
                  placeholder={config.namePlaceholder}
                  defaultValue={formData.name}
                  onChange={(value) => handleChange("name", value)}
                />
              ) : documentType === "ADDRESS_PROOF" ? (
                <SearchableSelect
                  options={ADDRESS_PROOF_TYPES}
                  placeholder={config.namePlaceholder}
                  defaultValue={formData.name}
                  onChange={(value) => handleChange("name", value)}
                />
              ) : (
                <Input
                  type="text"
                  placeholder={config.namePlaceholder}
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              )
            ) : (
              <Input
                type="text"
                value={formData.name}
                disabled
                className="bg-gray-50 dark:bg-gray-800"
              />
            )}
          </div>

          {/* Reference Number (Sexual Conviction Check) */}
          {config.showReferenceNumber && (
            <div>
              <Label>參考編號</Label>
              <Input
                type="text"
                placeholder="請輸入查核參考編號"
                value={formData.referenceNumber}
                onChange={(e) =>
                  handleChange("referenceNumber", e.target.value)
                }
              />
            </div>
          )}

          {/* Certificate Type (First Aid) */}
          {config.showCertificateType && (
            <div>
              <Label>證書類型</Label>
              <SearchableSelect
                options={FIRST_AID_CERTIFICATE_TYPES}
                placeholder="請選擇證書類型"
                defaultValue={formData.certificateType}
                onChange={(value) => handleChange("certificateType", value)}
              />
            </div>
          )}

          {/* Issuing Body */}
          {config.showIssuingBody && (
            <div>
              <Label>簽發機構</Label>
              {documentType === "FIRST_AID_CERTIFICATE" ? (
                <SearchableSelect
                  options={FIRST_AID_ISSUING_BODIES}
                  placeholder="請選擇或輸入簽發機構"
                  defaultValue={formData.issuingBody}
                  onChange={(value) => handleChange("issuingBody", value)}
                />
              ) : (
                <Input
                  type="text"
                  placeholder="請輸入簽發機構名稱"
                  value={formData.issuingBody}
                  onChange={(e) => handleChange("issuingBody", e.target.value)}
                />
              )}
            </div>
          )}

          {/* Issue Date & Expiry Date */}
          {(config.showIssueDate || config.showExpiryDate) && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {config.showIssueDate && (
                <div>
                  <Label>簽發日期</Label>
                  <Input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => handleChange("issueDate", e.target.value)}
                  />
                </div>
              )}

              {config.showExpiryDate && (
                <div>
                  <Label>到期日期</Label>
                  <Input
                    type="date"
                    value={formData.expiryDate || ""}
                    onChange={(e) => handleChange("expiryDate", e.target.value)}
                    disabled={formData.isPermanent}
                    className={
                      formData.isPermanent ? "bg-gray-50 dark:bg-gray-800" : ""
                    }
                  />
                </div>
              )}
            </div>
          )}

          {/* Permanent Toggle */}
          {config.allowPermanent && (
            <div className="flex items-center">
              <Switch
                label="永久有效（無到期日）"
                defaultChecked={formData.isPermanent}
                onChange={(checked) => handleChange("isPermanent", checked)}
              />
            </div>
          )}

          {/* File Upload */}
          <div>
            <Label>上傳文件</Label>
            <FileUploadArea
              file={formData.file || null}
              existingDocumentUrl={formData.existingDocumentUrl}
              acceptedFileTypes={config.acceptedFileTypes}
              maxFileSizeMB={config.maxFileSizeMB}
              onFileSelect={(file) => handleChange("file", file)}
              error={fileError}
              onError={setFileError}
            />
          </div>

          {/* Notes */}
          <div>
            <Label>備註（選填）</Label>
            <TextArea
              placeholder="如有其他需要說明的事項，請在此填寫"
              value={formData.notes}
              onChange={(value) => handleChange("notes", value)}
              rows={2}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between w-full mt-6">
          {hasExistingData && onDelete ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              disabled={isLoading}
              className="text-error-500 border-error-300 hover:bg-error-50 dark:text-error-400 dark:border-error-500/50 dark:hover:bg-error-500/10"
            >
              刪除資料
            </Button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? "儲存中..." : "儲存"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ============================================
// Types for Tutor Documents
// ============================================

export type DocumentType =
    | "IDENTITY_DOCUMENT"
    | "SEXUAL_CONVICTION_CHECK"
    | "BANK_DOCUMENT"
    | "ADDRESS_PROOF"
    | "FIRST_AID_CERTIFICATE"
    | "COACHING_CERTIFICATE"
    | "OTHER_CERTIFICATE";

export type DocumentStatus =
    | "valid"
    | "expired"
    | "expiring_soon"
    | "pending"
    | "not_submitted";

export interface TutorDocumentFormData {
    documentType: DocumentType;
    name: string;
    referenceNumber?: string;
    certificateType?: string;
    issuingBody?: string;
    issueDate?: string;
    expiryDate?: string | null;
    isPermanent?: boolean;
    file?: File | null;
    existingDocumentUrl?: string;
    notes?: string;
}

// ============================================
// Document Data Interfaces
// ============================================

export interface SexualConvictionCheck {
    status: DocumentStatus;
    issueDate?: string;
    expiryDate?: string;
    documentUrl?: string;
    referenceNumber?: string;
}

export interface FirstAidCertificate {
    status: DocumentStatus;
    issueDate?: string;
    expiryDate?: string;
    certificateType?: string;
    issuingBody?: string;
    documentUrl?: string;
}

export interface CoachingCertificate {
    id: string;
    name: string;
    status: DocumentStatus;
    issueDate?: string;
    expiryDate?: string | null;
    issuingBody?: string;
    documentUrl?: string;
}

export interface IdentityDocument {
    status: DocumentStatus;
    documentType?: string;
    uploadDate?: string;
    documentUrl?: string;
}

export interface OtherCertificate {
    id: string;
    name: string;
    status: DocumentStatus;
    issueDate?: string;
    expiryDate?: string | null;
    issuingBody?: string;
    documentUrl?: string;
}

export interface BankDocument {
    status: DocumentStatus;
    documentType?: string;
    bankName?: string;
    issueDate?: string;
    documentUrl?: string;
}

export interface AddressProof {
    status: DocumentStatus;
    documentType?: string;
    issueDate?: string;
    documentUrl?: string;
}

// ============================================
// Document Row Data (for table display)
// ============================================

export interface DocumentRowData {
    id?: string;
    name: string;
    status: DocumentStatus;
    issuingBody?: string;
    issueDate?: string;
    expiryDate?: string | null;
    documentUrl?: string;
    onAdd?: () => void;
}

// ============================================
// Constants
// ============================================

export const STATUS_BADGE_COLOR: Record<
    DocumentStatus,
    "success" | "warning" | "error" | "info" | "light"
> = {
    valid: "success",
    expiring_soon: "warning",
    expired: "error",
    pending: "info",
    not_submitted: "light",
};

export const STATUS_LABEL: Record<DocumentStatus, string> = {
    valid: "有效",
    expiring_soon: "即將過期",
    expired: "已過期",
    pending: "審核中",
    not_submitted: "未提交",
};

// ============================================
// Document Type Configuration
// ============================================

export interface DocumentTypeConfig {
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    nameEditable: boolean;
    showReferenceNumber: boolean;
    showCertificateType: boolean;
    showIssuingBody: boolean;
    showIssueDate: boolean;
    showExpiryDate: boolean;
    allowPermanent: boolean;
    acceptedFileTypes: string;
    maxFileSizeMB: number;
    description?: string;
}

export const DOCUMENT_TYPE_CONFIG: Record<DocumentType, DocumentTypeConfig> = {
    IDENTITY_DOCUMENT: {
        title: "香港身份證",
        nameLabel: "文件類型",
        namePlaceholder: "香港身份證",
        nameEditable: false,
        showReferenceNumber: false,
        showCertificateType: false,
        showIssuingBody: false,
        showIssueDate: false,
        showExpiryDate: false,
        allowPermanent: false,
        acceptedFileTypes: ".pdf,.jpg,.jpeg,.png",
        maxFileSizeMB: 5,
        description: "請上傳香港身份證正面照片",
    },
    SEXUAL_CONVICTION_CHECK: {
        title: "性罪行定罪紀錄查核",
        nameLabel: "文件名稱",
        namePlaceholder: "性罪行定罪紀錄查核",
        nameEditable: false,
        showReferenceNumber: true,
        showCertificateType: false,
        showIssuingBody: false,
        showIssueDate: true,
        showExpiryDate: true,
        allowPermanent: false,
        acceptedFileTypes: ".pdf,.jpg,.jpeg,.png",
        maxFileSizeMB: 5,
    },
    BANK_DOCUMENT: {
        title: "銀行資料文件",
        nameLabel: "文件類型",
        namePlaceholder: "請選擇文件類型",
        nameEditable: true,
        showReferenceNumber: false,
        showCertificateType: false,
        showIssuingBody: true,
        showIssueDate: true,
        showExpiryDate: false,
        allowPermanent: false,
        acceptedFileTypes: ".pdf,.jpg,.jpeg,.png",
        maxFileSizeMB: 5,
        description: "請上傳銀行月結單或銀行卡照片",
    },
    ADDRESS_PROOF: {
        title: "住址證明",
        nameLabel: "文件類型",
        namePlaceholder: "請選擇文件類型",
        nameEditable: true,
        showReferenceNumber: false,
        showCertificateType: false,
        showIssuingBody: false,
        showIssueDate: true,
        showExpiryDate: false,
        allowPermanent: false,
        acceptedFileTypes: ".pdf,.jpg,.jpeg,.png",
        maxFileSizeMB: 5,
        description: "用於郵寄支票或文件",
    },
    FIRST_AID_CERTIFICATE: {
        title: "急救證書",
        nameLabel: "證書名稱",
        namePlaceholder: "例如：急救證書",
        nameEditable: false,
        showReferenceNumber: false,
        showCertificateType: true,
        showIssuingBody: true,
        showIssueDate: true,
        showExpiryDate: true,
        allowPermanent: false,
        acceptedFileTypes: ".pdf,.jpg,.jpeg,.png",
        maxFileSizeMB: 5,
    },
    COACHING_CERTIFICATE: {
        title: "教練證書",
        nameLabel: "證書名稱",
        namePlaceholder: "例如：花式跳繩教練證書（一級）",
        nameEditable: true,
        showReferenceNumber: false,
        showCertificateType: false,
        showIssuingBody: true,
        showIssueDate: true,
        showExpiryDate: true,
        allowPermanent: true,
        acceptedFileTypes: ".pdf,.jpg,.jpeg,.png",
        maxFileSizeMB: 5,
    },
    OTHER_CERTIFICATE: {
        title: "其他證書",
        nameLabel: "證書名稱",
        namePlaceholder: "請輸入證書名稱",
        nameEditable: true,
        showReferenceNumber: false,
        showCertificateType: false,
        showIssuingBody: true,
        showIssueDate: true,
        showExpiryDate: true,
        allowPermanent: true,
        acceptedFileTypes: ".pdf,.jpg,.jpeg,.png",
        maxFileSizeMB: 5,
    },
};

// ============================================
// Select Options
// ============================================

export const FIRST_AID_CERTIFICATE_TYPES = [
    { value: "急救證書", label: "急救證書" },
    { value: "急救員證書", label: "急救員證書" },
    { value: "職業急救證書", label: "職業急救證書" },
    { value: "運動急救證書", label: "運動急救證書" },
    { value: "其他", label: "其他" },
];

export const FIRST_AID_ISSUING_BODIES = [
    { value: "香港紅十字會", label: "香港紅十字會" },
    { value: "香港聖約翰救傷隊", label: "香港聖約翰救傷隊" },
    { value: "醫療輔助隊", label: "醫療輔助隊" },
    { value: "其他", label: "其他" },
];

export const BANK_DOCUMENT_TYPES = [
    { value: "銀行月結單", label: "銀行月結單" },
    { value: "銀行卡照片", label: "銀行卡照片" },
    { value: "其他", label: "其他" },
];

export const ADDRESS_PROOF_TYPES = [
    { value: "水電煤賬單", label: "水電煤賬單" },
    { value: "銀行月結單", label: "銀行月結單" },
    { value: "政府信件", label: "政府信件" },
    { value: "其他", label: "其他" },
];

// ============================================
// Helper Functions
// ============================================

export function formatDate(dateString?: string | null): string {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-HK", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export function getDefaultName(type: DocumentType): string {
    switch (type) {
        case "IDENTITY_DOCUMENT":
            return "香港身份證";
        case "SEXUAL_CONVICTION_CHECK":
            return "性罪行定罪紀錄查核";
        case "BANK_DOCUMENT":
            return "";
        case "ADDRESS_PROOF":
            return "";
        case "FIRST_AID_CERTIFICATE":
            return "急救證書";
        case "COACHING_CERTIFICATE":
            return "";
        case "OTHER_CERTIFICATE":
            return "";
        default:
            return "";
    }
}

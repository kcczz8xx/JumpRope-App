import { prisma } from "@/lib/prisma";
import { Gender, UserRole, DocumentType, DocumentStatus } from "@prisma/client";

function maskIdentityCard(idCard: string): string {
    if (!idCard || idCard.length < 4) return idCard;
    const firstChar = idCard.charAt(0);
    const lastPart = idCard.slice(-3);
    const middleLength = idCard.length - 4;
    return `${firstChar}${"*".repeat(middleLength)}${lastPart}`;
}

export async function getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            address: true,
            bankAccount: true,
            children: {
                where: { deletedAt: null },
                orderBy: { createdAt: "asc" },
            },
            tutorProfile: {
                include: {
                    documents: true,
                },
            },
        },
    });

    if (!user) return null;

    const genderMap: Record<Gender, "男" | "女"> = {
        MALE: "男",
        FEMALE: "女",
    };

    const roleMap: Record<string, string> = {
        ADMIN: "管理員",
        STAFF: "職員",
        TUTOR: "導師",
        PARENT: "家長",
        STUDENT: "學生",
        USER: "會員",
    };

    const showIdentityCard = user.role === UserRole.TUTOR || user.role === UserRole.STUDENT;
    const showBankAccount = user.role === UserRole.TUTOR || user.role === UserRole.STAFF;
    const showChildren = user.role === UserRole.PARENT;
    const showTutor = user.role === UserRole.TUTOR;

    const documentStatusMap: Record<DocumentStatus, "valid" | "expired" | "expiring_soon" | "pending" | "not_submitted"> = {
        VALID: "valid",
        EXPIRED: "expired",
        EXPIRING_SOON: "expiring_soon",
        PENDING: "pending",
        NOT_SUBMITTED: "not_submitted",
    };

    const getTutorData = () => {
        if (!showTutor || !user.tutorProfile) return null;

        const documents = user.tutorProfile.documents || [];

        const findDocument = (type: DocumentType) => documents.find(d => d.documentType === type);

        const sexualConvictionDoc = findDocument(DocumentType.SEXUAL_CONVICTION_CHECK);
        const firstAidDoc = findDocument(DocumentType.FIRST_AID_CERTIFICATE);
        const identityDoc = findDocument(DocumentType.IDENTITY_DOCUMENT);

        const coachingCerts = documents.filter(d => d.documentType === DocumentType.COACHING_CERTIFICATE);
        const otherCerts = documents.filter(d => d.documentType === DocumentType.OTHER_CERTIFICATE);

        return {
            sexualConvictionCheck: sexualConvictionDoc ? {
                status: documentStatusMap[sexualConvictionDoc.status],
                issueDate: sexualConvictionDoc.issueDate?.toISOString(),
                expiryDate: sexualConvictionDoc.expiryDate?.toISOString(),
                documentUrl: sexualConvictionDoc.documentUrl || undefined,
                referenceNumber: sexualConvictionDoc.referenceNumber || undefined,
            } : undefined,
            firstAidCertificate: firstAidDoc ? {
                status: documentStatusMap[firstAidDoc.status],
                issueDate: firstAidDoc.issueDate?.toISOString(),
                expiryDate: firstAidDoc.expiryDate?.toISOString(),
                certificateType: firstAidDoc.certificateType || undefined,
                issuingBody: firstAidDoc.issuingBody || undefined,
                documentUrl: firstAidDoc.documentUrl || undefined,
            } : undefined,
            identityDocument: identityDoc ? {
                status: documentStatusMap[identityDoc.status],
                documentType: identityDoc.name,
                uploadDate: identityDoc.uploadDate?.toISOString(),
                documentUrl: identityDoc.documentUrl || undefined,
            } : undefined,
            coachingCertificates: coachingCerts.map(cert => ({
                id: cert.id,
                name: cert.name,
                status: documentStatusMap[cert.status],
                issueDate: cert.issueDate?.toISOString(),
                expiryDate: cert.expiryDate?.toISOString() || null,
                issuingBody: cert.issuingBody || undefined,
                documentUrl: cert.documentUrl || undefined,
            })),
            otherCertificates: otherCerts.map(cert => ({
                id: cert.id,
                name: cert.name,
                status: documentStatusMap[cert.status],
                issueDate: cert.issueDate?.toISOString(),
                expiryDate: cert.expiryDate?.toISOString() || null,
                issuingBody: cert.issuingBody || undefined,
                documentUrl: cert.documentUrl || undefined,
            })),
            bankInfo: user.bankAccount ? {
                status: "valid" as const,
                bankName: user.bankAccount.bankName || undefined,
                accountNumber: user.bankAccount.accountNumber || undefined,
                accountHolderName: user.bankAccount.accountHolderName || undefined,
            } : undefined,
        };
    };

    return {
        meta: {
            name: user.nickname || user.nameChinese || user.nameEnglish || "使用者",
            role: roleMap[user.role] || "會員",
        },
        info: {
            memberNumber: user.memberNumber || "",
            nickname: user.nickname || "",
            title: user.title || "",
            nameChinese: user.nameChinese || "",
            nameEnglish: user.nameEnglish || "",
            identityCardNumber: showIdentityCard
                ? maskIdentityCard(user.identityCardNumber || "")
                : "",
            gender: user.gender ? genderMap[user.gender] : ("" as const),
            email: user.email || "",
            phone: user.phone,
            whatsappEnabled: user.whatsappEnabled,
        },
        address: {
            district: user.address?.district || "",
            address: user.address?.address || "",
        },
        bank: showBankAccount
            ? {
                bankName: user.bankAccount?.bankName || "",
                accountNumber: user.bankAccount?.accountNumber || "",
                accountHolderName: user.bankAccount?.accountHolderName || "",
                fpsId: user.bankAccount?.fpsId || "",
                fpsEnabled: user.bankAccount?.fpsEnabled || false,
                notes: user.bankAccount?.notes || "",
            }
            : null,
        children: showChildren
            ? user.children.map((child) => ({
                id: child.id,
                memberNumber: child.memberNumber || "",
                nameChinese: child.nameChinese,
                nameEnglish: child.nameEnglish || "",
                birthYear: child.birthYear || undefined,
                school: child.school || "",
                gender: child.gender ? genderMap[child.gender] : undefined,
            }))
            : null,
        tutor: getTutorData(),
        showIdentityCard,
        showBankAccount,
        showChildren,
        showTutor,
    };
}

export type UserProfile = NonNullable<Awaited<ReturnType<typeof getUserProfile>>>;

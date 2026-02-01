import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { DocumentType, DocumentStatus } from "@prisma/client";
import { put, del } from "@vercel/blob";

// ============================================
// Types
// ============================================

interface CreateDocumentRequest {
    documentType: DocumentType;
    name: string;
    referenceNumber?: string;
    certificateType?: string;
    issuingBody?: string;
    issueDate?: string;
    expiryDate?: string | null;
    notes?: string;
}

// ============================================
// Security Helpers
// ============================================

const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateFileType(mimeType: string): boolean {
    return ALLOWED_MIME_TYPES.includes(mimeType);
}

function validateFileSize(size: number): boolean {
    return size <= MAX_FILE_SIZE;
}

function sanitizeFileName(fileName: string): string {
    return fileName
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .substring(0, 100);
}

// ============================================
// GET - List user's tutor documents
// ============================================

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "請先登入" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const documentType = searchParams.get("type") as DocumentType | null;

        const tutorProfile = await prisma.tutorProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                documents: documentType
                    ? { where: { documentType } }
                    : true,
            },
        });

        if (!tutorProfile) {
            return NextResponse.json({ documents: [] }, { status: 200 });
        }

        return NextResponse.json(
            { documents: tutorProfile.documents },
            { status: 200 }
        );
    } catch (error) {
        console.error("Get tutor documents error:", error);
        return NextResponse.json(
            { error: "獲取文件失敗，請稍後再試" },
            { status: 500 }
        );
    }
}

// ============================================
// POST - Create new tutor document
// ============================================

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "請先登入" }, { status: 401 });
        }

        const formData = await request.formData();

        const documentType = formData.get("documentType") as DocumentType;
        const name = formData.get("name") as string;
        const referenceNumber = formData.get("referenceNumber") as string | null;
        const certificateType = formData.get("certificateType") as string | null;
        const issuingBody = formData.get("issuingBody") as string | null;
        const issueDate = formData.get("issueDate") as string | null;
        const expiryDate = formData.get("expiryDate") as string | null;
        const notes = formData.get("notes") as string | null;
        const file = formData.get("file") as File | null;

        if (!documentType || !name) {
            return NextResponse.json(
                { error: "請填寫必要欄位" },
                { status: 400 }
            );
        }

        if (!file) {
            return NextResponse.json(
                { error: "請上傳文件" },
                { status: 400 }
            );
        }

        if (!validateFileType(file.type)) {
            return NextResponse.json(
                { error: "只接受 PDF、JPG 或 PNG 格式的文件" },
                { status: 400 }
            );
        }

        if (!validateFileSize(file.size)) {
            return NextResponse.json(
                { error: "文件大小不能超過 5MB" },
                { status: 400 }
            );
        }

        let tutorProfile = await prisma.tutorProfile.findUnique({
            where: { userId: session.user.id },
        });

        if (!tutorProfile) {
            tutorProfile = await prisma.tutorProfile.create({
                data: {
                    userId: session.user.id,
                },
            });
        }

        const timestamp = Date.now();
        const sanitizedName = sanitizeFileName(file.name);
        const blobPath = `tutor-documents/${session.user.id}/${documentType}/${timestamp}-${sanitizedName}`;

        const blob = await put(blobPath, file, {
            access: "public",
            addRandomSuffix: true,
        });

        const document = await prisma.tutorDocument.create({
            data: {
                tutorProfileId: tutorProfile.id,
                documentType,
                name,
                status: DocumentStatus.PENDING,
                referenceNumber: referenceNumber || null,
                certificateType: certificateType || null,
                issuingBody: issuingBody || null,
                issueDate: issueDate ? new Date(issueDate) : null,
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                documentUrl: blob.url,
                uploadDate: new Date(),
            },
        });

        console.log(
            `[Create Tutor Document] User ${session.user.id} created ${documentType} document`
        );

        return NextResponse.json(
            { message: "文件上傳成功", document },
            { status: 201 }
        );
    } catch (error) {
        console.error("Create tutor document error:", error);
        return NextResponse.json(
            { error: "上傳文件失敗，請稍後再試" },
            { status: 500 }
        );
    }
}

// ============================================
// PUT - Update existing tutor document
// ============================================

export async function PUT(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "請先登入" }, { status: 401 });
        }

        const formData = await request.formData();

        const documentId = formData.get("documentId") as string;
        const name = formData.get("name") as string;
        const referenceNumber = formData.get("referenceNumber") as string | null;
        const certificateType = formData.get("certificateType") as string | null;
        const issuingBody = formData.get("issuingBody") as string | null;
        const issueDate = formData.get("issueDate") as string | null;
        const expiryDate = formData.get("expiryDate") as string | null;
        const notes = formData.get("notes") as string | null;
        const file = formData.get("file") as File | null;

        if (!documentId) {
            return NextResponse.json(
                { error: "缺少文件 ID" },
                { status: 400 }
            );
        }

        const existingDocument = await prisma.tutorDocument.findFirst({
            where: {
                id: documentId,
                tutorProfile: {
                    userId: session.user.id,
                },
            },
        });

        if (!existingDocument) {
            return NextResponse.json(
                { error: "找不到該文件或無權限修改" },
                { status: 404 }
            );
        }

        let documentUrl = existingDocument.documentUrl;

        if (file) {
            if (!validateFileType(file.type)) {
                return NextResponse.json(
                    { error: "只接受 PDF、JPG 或 PNG 格式的文件" },
                    { status: 400 }
                );
            }

            if (!validateFileSize(file.size)) {
                return NextResponse.json(
                    { error: "文件大小不能超過 5MB" },
                    { status: 400 }
                );
            }

            if (existingDocument.documentUrl) {
                try {
                    await del(existingDocument.documentUrl);
                } catch (deleteError) {
                    console.warn("Failed to delete old blob:", deleteError);
                }
            }

            const timestamp = Date.now();
            const sanitizedName = sanitizeFileName(file.name);
            const blobPath = `tutor-documents/${session.user.id}/${existingDocument.documentType}/${timestamp}-${sanitizedName}`;

            const blob = await put(blobPath, file, {
                access: "public",
                addRandomSuffix: true,
            });

            documentUrl = blob.url;
        }

        const updatedDocument = await prisma.tutorDocument.update({
            where: { id: documentId },
            data: {
                name: name || existingDocument.name,
                status: DocumentStatus.PENDING,
                referenceNumber: referenceNumber ?? existingDocument.referenceNumber,
                certificateType: certificateType ?? existingDocument.certificateType,
                issuingBody: issuingBody ?? existingDocument.issuingBody,
                issueDate: issueDate ? new Date(issueDate) : existingDocument.issueDate,
                expiryDate: expiryDate === "" ? null : expiryDate ? new Date(expiryDate) : existingDocument.expiryDate,
                documentUrl,
                uploadDate: file ? new Date() : existingDocument.uploadDate,
                reviewedAt: null,
                reviewedBy: null,
                reviewNote: null,
            },
        });

        console.log(
            `[Update Tutor Document] User ${session.user.id} updated document ${documentId}`
        );

        return NextResponse.json(
            { message: "文件更新成功", document: updatedDocument },
            { status: 200 }
        );
    } catch (error) {
        console.error("Update tutor document error:", error);
        return NextResponse.json(
            { error: "更新文件失敗，請稍後再試" },
            { status: 500 }
        );
    }
}

// ============================================
// DELETE - Delete tutor document
// ============================================

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "請先登入" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const documentId = searchParams.get("id");

        if (!documentId) {
            return NextResponse.json(
                { error: "缺少文件 ID" },
                { status: 400 }
            );
        }

        const existingDocument = await prisma.tutorDocument.findFirst({
            where: {
                id: documentId,
                tutorProfile: {
                    userId: session.user.id,
                },
            },
        });

        if (!existingDocument) {
            return NextResponse.json(
                { error: "找不到該文件或無權限刪除" },
                { status: 404 }
            );
        }

        if (existingDocument.documentUrl) {
            try {
                await del(existingDocument.documentUrl);
            } catch (deleteError) {
                console.warn("Failed to delete blob:", deleteError);
            }
        }

        await prisma.tutorDocument.delete({
            where: { id: documentId },
        });

        console.log(
            `[Delete Tutor Document] User ${session.user.id} deleted document ${documentId}`
        );

        return NextResponse.json(
            { message: "文件已刪除" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Delete tutor document error:", error);
        return NextResponse.json(
            { error: "刪除文件失敗，請稍後再試" },
            { status: 500 }
        );
    }
}

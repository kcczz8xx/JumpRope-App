/**
 * User Queries - Tutor Documents
 * 導師文件查詢
 */

import { prisma } from "@/lib/db";
import { requireUser, success, type ActionResult } from "@/lib/actions";

export async function getTutorDocuments(documentType?: string): Promise<
  ActionResult<
    Array<{
      id: string;
      documentType: string;
      name: string;
      status: string;
      referenceNumber: string | null;
      certificateType: string | null;
      issuingBody: string | null;
      issueDate: Date | null;
      expiryDate: Date | null;
      documentUrl: string | null;
      uploadDate: Date | null;
    }>
  >
> {
  const auth = await requireUser();
  if (!auth.ok) return auth;

  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId: auth.data.id },
    include: {
      documents: documentType
        ? { where: { documentType: documentType as never } }
        : true,
    },
  });

  if (!tutorProfile) {
    return success([]);
  }

  return success(tutorProfile.documents);
}

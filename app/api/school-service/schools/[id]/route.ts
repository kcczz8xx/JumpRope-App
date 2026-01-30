import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const school = await prisma.school.findUnique({
            where: {
                id,
            },
            include: {
                contacts: {
                    where: {
                        deletedAt: null,
                    },
                    orderBy: [
                        { isPrimary: "desc" },
                        { createdAt: "asc" },
                    ],
                },
            },
        });

        if (!school || school.deletedAt) {
            return NextResponse.json(
                { message: "學校不存在" },
                { status: 404 }
            );
        }

        return NextResponse.json(school);
    } catch (error) {
        console.error("Failed to fetch school:", error);
        return NextResponse.json(
            { message: "獲取學校資料失敗" },
            { status: 500 }
        );
    }
}

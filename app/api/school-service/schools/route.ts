import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const schools = await prisma.school.findMany({
            where: {
                deletedAt: null,
            },
            select: {
                id: true,
                schoolName: true,
                schoolNameEnglish: true,
                partnershipStatus: true,
            },
            orderBy: {
                schoolName: "asc",
            },
        });

        return NextResponse.json(schools);
    } catch (error) {
        console.error("Failed to fetch schools:", error);
        return NextResponse.json(
            { message: "Failed to fetch schools" },
            { status: 500 }
        );
    }
}

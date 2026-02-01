import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const schools = await prisma.school.findMany({
            where: {
                deletedAt: null,
            },
            select: {
                id: true,
                schoolName: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // 按學校名稱去重，保留最新的一筆
        const uniqueSchools = schools.reduce((acc, school) => {
            if (!acc.has(school.schoolName)) {
                acc.set(school.schoolName, school);
            }
            return acc;
        }, new Map<string, typeof schools[0]>());

        const result = Array.from(uniqueSchools.values())
            .sort((a, b) => a.schoolName.localeCompare(b.schoolName, 'zh-Hant'));

        return NextResponse.json(result);
    } catch (error) {
        console.error("Failed to fetch schools:", error);
        return NextResponse.json(
            { message: "Failed to fetch schools" },
            { status: 500 }
        );
    }
}

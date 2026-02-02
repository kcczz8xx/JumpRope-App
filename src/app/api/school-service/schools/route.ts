/**
 * @deprecated 此 API Route 已遷移至 Server Actions
 * 請使用 `@/features/school-service` 中的 `createSchoolAction` 和 `getSchools`
 * 此文件保留作為參考，將在未來版本移除
 */

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

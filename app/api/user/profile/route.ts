import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface UpdateProfileRequest {
    nickname?: string;
    email?: string;
    phone?: string;
    whatsappEnabled?: boolean;
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "請先登入" }, { status: 401 });
        }

        const body: UpdateProfileRequest = await request.json();
        const { nickname, email, phone, whatsappEnabled } = body;

        const updateData: Record<string, unknown> = {};

        if (nickname !== undefined) {
            updateData.nickname = nickname;
        }

        if (email !== undefined) {
            if (email) {
                const existingUser = await prisma.user.findFirst({
                    where: {
                        email,
                        id: { not: session.user.id },
                    },
                });
                if (existingUser) {
                    return NextResponse.json(
                        { error: "此電郵地址已被使用" },
                        { status: 409 }
                    );
                }
            }
            updateData.email = email || null;
        }

        if (phone !== undefined) {
            if (phone) {
                const existingUser = await prisma.user.findFirst({
                    where: {
                        phone,
                        id: { not: session.user.id },
                    },
                });
                if (existingUser) {
                    return NextResponse.json(
                        { error: "此電話號碼已被使用" },
                        { status: 409 }
                    );
                }
            }
            updateData.phone = phone || null;
        }

        if (whatsappEnabled !== undefined) {
            updateData.whatsappEnabled = whatsappEnabled;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "沒有要更新的資料" },
                { status: 400 }
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: {
                id: true,
                nickname: true,
                email: true,
                phone: true,
                whatsappEnabled: true,
            },
        });

        console.log(`[Update Profile] User ${session.user.id} updated profile`);

        return NextResponse.json(
            { message: "資料更新成功", user: updatedUser },
            { status: 200 }
        );
    } catch (error) {
        console.error("Update profile error:", error);
        return NextResponse.json(
            { error: "更新資料失敗，請稍後再試" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import {
    checkAuth,
    unauthorizedResponse,
} from "@/lib/rbac/check-permission";

interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export async function POST(request: NextRequest) {
    try {
        const authResult = await checkAuth();

        if (!authResult.authorized) {
            return unauthorizedResponse(authResult.error);
        }

        const userId = authResult.userId!;

        const body: ChangePasswordRequest = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: "請提供目前密碼和新密碼" },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: "新密碼至少需要 8 個字元" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { passwordHash: true },
        });

        if (!user || !user.passwordHash) {
            return NextResponse.json({ error: "用戶不存在或無法修改密碼" }, { status: 404 });
        }

        const isPasswordValid = await bcrypt.compare(
            currentPassword,
            user.passwordHash
        );

        if (!isPasswordValid) {
            return NextResponse.json({ error: "目前密碼不正確" }, { status: 400 });
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });

        return NextResponse.json({ message: "密碼修改成功" }, { status: 200 });
    } catch (error) {
        console.error("Change password error:", error);
        return NextResponse.json(
            { error: "修改密碼失敗，請稍後再試" },
            { status: 500 }
        );
    }
}

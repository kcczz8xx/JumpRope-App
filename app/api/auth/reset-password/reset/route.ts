import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

interface ResetPasswordRequest {
    phone: string;
    password: string;
    resetToken?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: ResetPasswordRequest = await request.json();
        const { phone, password } = body;

        if (!phone || !password) {
            return NextResponse.json(
                { error: "請提供電話號碼和新密碼" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "密碼至少需要 8 個字元" },
                { status: 400 }
            );
        }

        // TODO: 驗證 resetToken 是否有效
        // 實際整合時需要：
        // 1. 驗證 resetToken 是否存在且未過期
        // 2. 驗證 resetToken 是否屬於該用戶

        const user = await prisma.user.findUnique({
            where: { phone },
        });

        if (!user) {
            return NextResponse.json(
                { error: "用戶不存在" },
                { status: 404 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 12);

        await prisma.user.update({
            where: { phone },
            data: { passwordHash },
        });

        // TODO: 刪除或標記 resetToken 已使用

        return NextResponse.json(
            { message: "密碼重設成功" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { error: "重設密碼失敗，請稍後再試" },
            { status: 500 }
        );
    }
}

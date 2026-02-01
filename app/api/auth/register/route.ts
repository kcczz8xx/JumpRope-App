import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { rateLimit, getClientIP, RATE_LIMIT_CONFIGS } from "@/lib/server";
import { generateMemberNumber } from "@/lib/services";

interface RegisterRequest {
    phone: string;
    password: string;
    email: string;
    nickname: string;
    title: string;
}

export async function POST(request: NextRequest) {
    try {
        const clientIP = getClientIP(request);
        const rateLimitResult = rateLimit(
            `register:${clientIP}`,
            RATE_LIMIT_CONFIGS.REGISTER
        );

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { error: "請求過於頻繁，請稍後再試" },
                { status: 429 }
            );
        }

        const body: RegisterRequest = await request.json();
        const { phone, password, email, nickname, title } = body;

        if (!phone || !password || !email || !nickname || !title) {
            return NextResponse.json(
                { error: "所有欄位皆為必填" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "密碼至少需要 8 個字元" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ phone }, { email }],
            },
        });

        if (existingUser) {
            if (existingUser.phone === phone) {
                return NextResponse.json(
                    { error: "此電話號碼已被註冊" },
                    { status: 409 }
                );
            }
            if (existingUser.email === email) {
                return NextResponse.json(
                    { error: "此電郵地址已被註冊" },
                    { status: 409 }
                );
            }
        }

        const passwordHash = await bcrypt.hash(password, 12);

        // 自動生成有序會員編號
        const memberNumber = await generateMemberNumber();

        const user = await prisma.user.create({
            data: {
                phone,
                email,
                nickname,
                title,
                passwordHash,
                memberNumber,
                role: "USER",
            },
            select: {
                id: true,
                phone: true,
                email: true,
                nickname: true,
                title: true,
                memberNumber: true,
                role: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            { message: "註冊成功", user },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "註冊失敗，請稍後再試" },
            { status: 500 }
        );
    }
}

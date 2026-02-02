import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { rateLimit, getClientIP, RATE_LIMIT_CONFIGS } from "@/lib/server";
import { createUserWithMemberNumber } from "@/lib/services";
import { OTP_CONFIG } from "@/lib/constants/otp";

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
        const rateLimitResult = await rateLimit(
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

        const verifiedOtp = await prisma.otp.findFirst({
            where: {
                phone,
                purpose: "REGISTER",
                verified: true,
                expiresAt: { gte: new Date(Date.now() - OTP_CONFIG.REGISTER_VERIFY_WINDOW_MS) },
            },
            orderBy: { createdAt: "desc" },
        });

        if (!verifiedOtp) {
            return NextResponse.json(
                { error: "請先完成電話號碼驗證" },
                { status: 403 }
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

        const user = await createUserWithMemberNumber({
            phone,
            email,
            nickname,
            title,
            passwordHash,
            role: "USER",
        });

        await prisma.otp.deleteMany({
            where: {
                phone,
                purpose: "REGISTER",
                verified: true,
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

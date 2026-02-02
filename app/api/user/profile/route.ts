import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
    checkPermission,
    unauthorizedResponse,
    forbiddenResponse,
} from "@/lib/rbac/check-permission";

interface UpdateProfileRequest {
    nickname?: string;
    email?: string;
    phone?: string;
    whatsappEnabled?: boolean;
}

export async function GET() {
    try {
        const authResult = await checkPermission("USER_PROFILE_READ_OWN");

        if (!authResult.authorized) {
            return authResult.status === 401
                ? unauthorizedResponse(authResult.error)
                : forbiddenResponse(authResult.error);
        }

        const user = await prisma.user.findUnique({
            where: { id: authResult.userId },
            select: {
                id: true,
                memberNumber: true,
                title: true,
                phone: true,
                email: true,
                nameChinese: true,
                nameEnglish: true,
                nickname: true,
                gender: true,
                identityCardNumber: true,
                whatsappEnabled: true,
                role: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "用戶不存在" }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error("Get profile error:", error);
        return NextResponse.json(
            { error: "獲取資料失敗，請稍後再試" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const authResult = await checkPermission("USER_PROFILE_UPDATE_OWN");

        if (!authResult.authorized) {
            return authResult.status === 401
                ? unauthorizedResponse(authResult.error)
                : forbiddenResponse(authResult.error);
        }

        const userId = authResult.userId!;
        const body: UpdateProfileRequest = await request.json();
        const { nickname, email, phone, whatsappEnabled } = body;

        const updateData: Record<string, unknown> = {};
        const otpPhonesToDelete: string[] = [];

        if (nickname !== undefined) {
            updateData.nickname = nickname;
        }

        if (email !== undefined) {
            if (email) {
                const currentUser = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { email: true, phone: true },
                });

                if (currentUser?.email !== email) {
                    const verifiedOtp = await prisma.otp.findFirst({
                        where: {
                            phone: currentUser?.phone || "",
                            purpose: "UPDATE_CONTACT",
                            verified: true,
                            expiresAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
                        },
                        orderBy: { createdAt: "desc" },
                    });

                    if (!verifiedOtp) {
                        return NextResponse.json(
                            { error: "請先完成電郵地址驗證" },
                            { status: 403 }
                        );
                    }

                    if (currentUser?.phone) {
                        otpPhonesToDelete.push(currentUser.phone);
                    }
                }

                const existingUser = await prisma.user.findFirst({
                    where: {
                        email,
                        id: { not: userId },
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
            if (!phone) {
                return NextResponse.json(
                    { error: "電話號碼不能為空" },
                    { status: 400 }
                );
            }

            const currentUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { phone: true },
            });

            if (currentUser?.phone !== phone) {
                const verifiedOtp = await prisma.otp.findFirst({
                    where: {
                        phone,
                        purpose: "UPDATE_CONTACT",
                        verified: true,
                        expiresAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
                    },
                    orderBy: { createdAt: "desc" },
                });

                if (!verifiedOtp) {
                    return NextResponse.json(
                        { error: "請先完成新電話號碼驗證" },
                        { status: 403 }
                    );
                }

                otpPhonesToDelete.push(phone);
            }

            const existingUser = await prisma.user.findFirst({
                where: {
                    phone,
                    id: { not: userId },
                },
            });
            if (existingUser) {
                return NextResponse.json(
                    { error: "此電話號碼已被使用" },
                    { status: 409 }
                );
            }
            updateData.phone = phone;
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
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                nickname: true,
                email: true,
                phone: true,
                whatsappEnabled: true,
            },
        });

        if (otpPhonesToDelete.length > 0) {
            await prisma.otp.deleteMany({
                where: {
                    phone: { in: otpPhonesToDelete },
                    purpose: "UPDATE_CONTACT",
                    verified: true,
                },
            });
        }

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

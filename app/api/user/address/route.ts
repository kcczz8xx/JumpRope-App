import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
    checkPermission,
    unauthorizedResponse,
    forbiddenResponse,
} from "@/lib/rbac/check-permission";

interface UpdateAddressRequest {
    region?: string;
    district: string;
    address: string;
}

export async function GET() {
    try {
        const authResult = await checkPermission("USER_PROFILE_READ_OWN");

        if (!authResult.authorized) {
            return authResult.status === 401
                ? unauthorizedResponse(authResult.error)
                : forbiddenResponse(authResult.error);
        }

        const userAddress = await prisma.userAddress.findUnique({
            where: { userId: authResult.userId },
        });

        return NextResponse.json({ address: userAddress }, { status: 200 });
    } catch (error) {
        console.error("Get address error:", error);
        return NextResponse.json(
            { error: "獲取地址失敗，請稍後再試" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const authResult = await checkPermission("USER_PROFILE_UPDATE_OWN");

        if (!authResult.authorized) {
            return authResult.status === 401
                ? unauthorizedResponse(authResult.error)
                : forbiddenResponse(authResult.error);
        }

        const userId = authResult.userId!;
        const body: UpdateAddressRequest = await request.json();
        const { region, district, address } = body;

        if (!district || !address) {
            return NextResponse.json(
                { error: "請填寫地區和詳細地址" },
                { status: 400 }
            );
        }

        const updatedAddress = await prisma.userAddress.upsert({
            where: { userId },
            update: {
                region: region || null,
                district,
                address,
            },
            create: {
                userId,
                region: region || null,
                district,
                address,
            },
        });

        console.log(`[Update Address] User ${userId} updated address`);

        return NextResponse.json(
            { message: "地址更新成功", address: updatedAddress },
            { status: 200 }
        );
    } catch (error) {
        console.error("Update address error:", error);
        return NextResponse.json(
            { error: "更新地址失敗，請稍後再試" },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    try {
        const authResult = await checkPermission("USER_PROFILE_UPDATE_OWN");

        if (!authResult.authorized) {
            return authResult.status === 401
                ? unauthorizedResponse(authResult.error)
                : forbiddenResponse(authResult.error);
        }

        const userId = authResult.userId!;

        const existingAddress = await prisma.userAddress.findUnique({
            where: { userId },
        });

        if (!existingAddress) {
            return NextResponse.json({ error: "沒有地址資料可刪除" }, { status: 404 });
        }

        await prisma.userAddress.delete({
            where: { userId },
        });

        console.log(`[Delete Address] User ${userId} deleted address`);

        return NextResponse.json({ message: "地址已刪除" }, { status: 200 });
    } catch (error) {
        console.error("Delete address error:", error);
        return NextResponse.json(
            { error: "刪除地址失敗，請稍後再試" },
            { status: 500 }
        );
    }
}

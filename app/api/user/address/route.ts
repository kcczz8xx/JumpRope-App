import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface UpdateAddressRequest {
    region?: string;
    district: string;
    address: string;
}

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "請先登入" }, { status: 401 });
        }

        const userAddress = await prisma.userAddress.findUnique({
            where: { userId: session.user.id },
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
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "請先登入" }, { status: 401 });
        }

        const body: UpdateAddressRequest = await request.json();
        const { region, district, address } = body;

        if (!district || !address) {
            return NextResponse.json(
                { error: "請填寫地區和詳細地址" },
                { status: 400 }
            );
        }

        const updatedAddress = await prisma.userAddress.upsert({
            where: { userId: session.user.id },
            update: {
                region: region || null,
                district,
                address,
            },
            create: {
                userId: session.user.id,
                region: region || null,
                district,
                address,
            },
        });

        console.log(`[Update Address] User ${session.user.id} updated address`);

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
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: "請先登入" }, { status: 401 });
        }

        const existingAddress = await prisma.userAddress.findUnique({
            where: { userId: session.user.id },
        });

        if (!existingAddress) {
            return NextResponse.json({ error: "沒有地址資料可刪除" }, { status: 404 });
        }

        await prisma.userAddress.delete({
            where: { userId: session.user.id },
        });

        console.log(`[Delete Address] User ${session.user.id} deleted address`);

        return NextResponse.json({ message: "地址已刪除" }, { status: 200 });
    } catch (error) {
        console.error("Delete address error:", error);
        return NextResponse.json(
            { error: "刪除地址失敗，請稍後再試" },
            { status: 500 }
        );
    }
}

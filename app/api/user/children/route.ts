import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  checkPermission,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/rbac/check-permission";

export async function GET() {
  try {
    const authResult = await checkPermission("CHILD_READ_OWN");

    if (!authResult.authorized) {
      return authResult.status === 401
        ? unauthorizedResponse(authResult.error)
        : forbiddenResponse(authResult.error);
    }

    const children = await prisma.userChild.findMany({
      where: {
        parentId: authResult.userId,
        deletedAt: null,
      },
      select: {
        id: true,
        memberNumber: true,
        nameChinese: true,
        nameEnglish: true,
        birthYear: true,
        school: true,
        gender: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ children }, { status: 200 });
  } catch (error) {
    console.error("Get children error:", error);
    return NextResponse.json(
      { error: "獲取學員資料失敗，請稍後再試" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await checkPermission("CHILD_CREATE");

    if (!authResult.authorized) {
      return authResult.status === 401
        ? unauthorizedResponse(authResult.error)
        : forbiddenResponse(authResult.error);
    }

    const userId = authResult.userId!;
    const body = await request.json();

    if (!body.nameChinese || body.nameChinese.trim() === "") {
      return NextResponse.json(
        { error: "請輸入學員中文名" },
        { status: 400 }
      );
    }

    const child = await prisma.userChild.create({
      data: {
        parentId: userId,
        nameChinese: body.nameChinese,
        nameEnglish: body.nameEnglish || null,
        birthYear: body.birthYear ? parseInt(body.birthYear, 10) : null,
        school: body.school || null,
        gender: body.gender || null,
      },
      select: {
        id: true,
        memberNumber: true,
        nameChinese: true,
        nameEnglish: true,
        birthYear: true,
        school: true,
        gender: true,
      },
    });

    return NextResponse.json({ child }, { status: 201 });
  } catch (error) {
    console.error("Create child error:", error);
    return NextResponse.json(
      { error: "新增學員失敗，請稍後再試" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await checkPermission("CHILD_UPDATE_OWN");

    if (!authResult.authorized) {
      return authResult.status === 401
        ? unauthorizedResponse(authResult.error)
        : forbiddenResponse(authResult.error);
    }

    const userId = authResult.userId!;
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "缺少學員 ID" }, { status: 400 });
    }

    if (!body.nameChinese || body.nameChinese.trim() === "") {
      return NextResponse.json(
        { error: "請輸入學員中文名" },
        { status: 400 }
      );
    }

    const existingChild = await prisma.userChild.findFirst({
      where: {
        id: body.id,
        parentId: userId,
        deletedAt: null,
      },
    });

    if (!existingChild) {
      return NextResponse.json({ error: "學員不存在" }, { status: 404 });
    }

    const child = await prisma.userChild.update({
      where: { id: body.id },
      data: {
        nameChinese: body.nameChinese,
        nameEnglish: body.nameEnglish || null,
        birthYear: body.birthYear ? parseInt(body.birthYear, 10) : null,
        school: body.school || null,
        gender: body.gender || null,
      },
      select: {
        id: true,
        memberNumber: true,
        nameChinese: true,
        nameEnglish: true,
        birthYear: true,
        school: true,
        gender: true,
      },
    });

    return NextResponse.json({ child }, { status: 200 });
  } catch (error) {
    console.error("Update child error:", error);
    return NextResponse.json(
      { error: "更新學員資料失敗，請稍後再試" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await checkPermission("CHILD_DELETE_OWN");

    if (!authResult.authorized) {
      return authResult.status === 401
        ? unauthorizedResponse(authResult.error)
        : forbiddenResponse(authResult.error);
    }

    const userId = authResult.userId!;
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("id");

    if (!childId) {
      return NextResponse.json({ error: "缺少學員 ID" }, { status: 400 });
    }

    const existingChild = await prisma.userChild.findFirst({
      where: {
        id: childId,
        parentId: userId,
        deletedAt: null,
      },
    });

    if (!existingChild) {
      return NextResponse.json({ error: "學員不存在" }, { status: 404 });
    }

    await prisma.userChild.update({
      where: { id: childId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete child error:", error);
    return NextResponse.json(
      { error: "刪除學員失敗，請稍後再試" },
      { status: 500 }
    );
  }
}

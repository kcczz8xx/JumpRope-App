import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

type UserRole = "ADMIN" | "STAFF" | "TUTOR" | "PARENT" | "STUDENT" | "USER";

const ROLE_ROUTES: Record<string, UserRole[]> = {
    "/dashboard/admin": ["ADMIN"],
    "/dashboard/staff": ["STAFF", "ADMIN"],
    "/dashboard/tutor": ["TUTOR", "ADMIN"],
    "/dashboard/school": ["STAFF", "ADMIN"],
};

function checkRoleAccess(pathname: string, userRole: UserRole | undefined): boolean {
    for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
        if (pathname.startsWith(routePrefix)) {
            return userRole ? allowedRoles.includes(userRole) : false;
        }
    }
    return true;
}

export default auth((req) => {
    const { nextUrl } = req;
    const userRole = req.auth?.user?.role as UserRole | undefined;

    // 角色權限檢查（認證邏輯已在 authOptions.callbacks.authorized 處理）
    if (nextUrl.pathname.startsWith("/dashboard") && req.auth) {
        const hasRoleAccess = checkRoleAccess(nextUrl.pathname, userRole);
        if (!hasRoleAccess) {
            return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)",
    ],
};

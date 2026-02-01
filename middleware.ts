import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

type UserRole = "ADMIN" | "STAFF" | "TUTOR" | "PARENT" | "STUDENT" | "USER";

const protectedRoutes = ["/dashboard"];
const authRoutes = ["/signin", "/signup", "/reset-password"];

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
    const isLoggedIn = !!req.auth;
    const userRole = req.auth?.user?.role as UserRole | undefined;

    const isProtectedRoute = protectedRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
    );

    const isAuthRoute = authRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
    );

    if (isProtectedRoute && !isLoggedIn) {
        const signInUrl = new URL("/signin", nextUrl.origin);
        signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
    }

    if (isProtectedRoute && isLoggedIn) {
        const hasRoleAccess = checkRoleAccess(nextUrl.pathname, userRole);
        if (!hasRoleAccess) {
            return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
        }
    }

    if (isAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)",
    ],
};

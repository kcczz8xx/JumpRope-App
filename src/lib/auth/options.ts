import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import "@/lib/auth/types";

export const authOptions: NextAuthConfig = {
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                identifier: { label: "電話號碼或會員編號", type: "text" },
                password: { label: "密碼", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.identifier || !credentials?.password) {
                    return null;
                }

                const identifier = credentials.identifier as string;
                const password = credentials.password as string;

                const user = await prisma.user.findFirst({
                    where: {
                        OR: [{ phone: identifier }, { memberNumber: identifier }],
                        deletedAt: null,
                    },
                });

                if (!user || !user.passwordHash) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(
                    password,
                    user.passwordHash
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    phone: user.phone,
                    email: user.email,
                    name: user.nickname || user.nameChinese || user.nameEnglish,
                    role: user.role,
                    memberNumber: user.memberNumber,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60,
    },
    pages: {
        signIn: "/signin",
        error: "/signin",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard");
            const isAuthRoute = ["/signin", "/signup", "/reset-password"].some(
                (route) => nextUrl.pathname.startsWith(route)
            );

            // 未登入訪問受保護路由 → 拒絕（middleware 會處理重定向）
            if (isProtectedRoute && !isLoggedIn) {
                return false;
            }

            // 已登入訪問認證頁面 → 重定向到 dashboard
            if (isAuthRoute && isLoggedIn) {
                return Response.redirect(new URL("/dashboard", nextUrl));
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.phone = user.phone;
                token.memberNumber = user.memberNumber;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as UserRole;
                session.user.phone = token.phone as string;
                session.user.memberNumber = token.memberNumber as string | null;
            }
            return session;
        },
    },
};

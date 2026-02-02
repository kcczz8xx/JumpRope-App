import type { UserRole } from "@prisma/client";

declare module "next-auth" {
    interface User {
        id: string;
        role: UserRole;
        phone: string;
        memberNumber: string | null;
        email?: string | null;
        name?: string | null;
    }

    interface Session {
        user: {
            id: string;
            role: UserRole;
            phone: string;
            memberNumber: string | null;
            email?: string | null;
            name?: string | null;
        };
    }
}

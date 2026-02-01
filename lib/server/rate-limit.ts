type RateLimitRecord = {
    count: number;
    resetTime: number;
};

const rateLimitStore = new Map<string, RateLimitRecord>();

interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
    windowMs: 60 * 1000,
    maxRequests: 10,
};

export function rateLimit(
    identifier: string,
    config: Partial<RateLimitConfig> = {}
): { success: boolean; remaining: number; resetIn: number } {
    const { windowMs, maxRequests } = { ...DEFAULT_CONFIG, ...config };
    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    if (!record || now > record.resetTime) {
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + windowMs,
        });
        return {
            success: true,
            remaining: maxRequests - 1,
            resetIn: windowMs,
        };
    }

    if (record.count >= maxRequests) {
        return {
            success: false,
            remaining: 0,
            resetIn: record.resetTime - now,
        };
    }

    record.count += 1;
    return {
        success: true,
        remaining: maxRequests - record.count,
        resetIn: record.resetTime - now,
    };
}

export function getClientIP(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    const realIP = request.headers.get("x-real-ip");
    if (realIP) {
        return realIP;
    }
    return "unknown";
}

export const RATE_LIMIT_CONFIGS = {
    OTP_SEND: { windowMs: 60 * 1000, maxRequests: 3 },
    OTP_VERIFY: { windowMs: 60 * 1000, maxRequests: 5 },
    REGISTER: { windowMs: 60 * 60 * 1000, maxRequests: 5 },
    LOGIN: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
    RESET_PASSWORD: { windowMs: 60 * 60 * 1000, maxRequests: 5 },
} as const;

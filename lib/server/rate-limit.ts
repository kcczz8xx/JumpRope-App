import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate Limit 配置
 * 使用 Upstash Redis 實現，支援 serverless 環境
 * 
 * 環境變數：
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const isRedisConfigured = !!(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN);

const redis = isRedisConfigured
    ? new Redis({
        url: UPSTASH_REDIS_REST_URL!,
        token: UPSTASH_REDIS_REST_TOKEN!,
    })
    : null;

const rateLimiters = redis
    ? {
        otpSend: new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(3, "60 s"),
            prefix: "ratelimit:otp_send",
            analytics: true,
        }),
        otpVerify: new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(5, "60 s"),
            prefix: "ratelimit:otp_verify",
            analytics: true,
        }),
        register: new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(5, "1 h"),
            prefix: "ratelimit:register",
            analytics: true,
        }),
        login: new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(10, "15 m"),
            prefix: "ratelimit:login",
            analytics: true,
        }),
        resetPassword: new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(5, "1 h"),
            prefix: "ratelimit:reset_password",
            analytics: true,
        }),
        childCreate: new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(10, "1 h"),
            prefix: "ratelimit:child_create",
            analytics: true,
        }),
    }
    : null;

type RateLimitType = "otpSend" | "otpVerify" | "register" | "login" | "resetPassword" | "childCreate";

interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
}

export const RATE_LIMIT_CONFIGS = {
    OTP_SEND: { windowMs: 60 * 1000, maxRequests: 3 },
    OTP_VERIFY: { windowMs: 60 * 1000, maxRequests: 5 },
    REGISTER: { windowMs: 60 * 60 * 1000, maxRequests: 5 },
    LOGIN: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
    RESET_PASSWORD: { windowMs: 60 * 60 * 1000, maxRequests: 5 },
    CHILD_CREATE: { windowMs: 60 * 60 * 1000, maxRequests: 10 },
} as const;

const configToType: Record<string, RateLimitType> = {
    OTP_SEND: "otpSend",
    OTP_VERIFY: "otpVerify",
    REGISTER: "register",
    LOGIN: "login",
    RESET_PASSWORD: "resetPassword",
    CHILD_CREATE: "childCreate",
};

/**
 * Rate Limit 檢查函數
 * @param identifier 識別符（通常是 `${type}:${clientIP}`）
 * @param config Rate limit 配置
 * @returns 包含 success、remaining、resetIn 的結果
 */
export async function rateLimit(
    identifier: string,
    config: Partial<RateLimitConfig> = {}
): Promise<{ success: boolean; remaining: number; resetIn: number }> {
    if (!rateLimiters) {
        console.warn("Rate limit: Redis not configured, using fail-closed strategy");
        return {
            success: false,
            remaining: 0,
            resetIn: 60000,
        };
    }

    const configKey = Object.keys(RATE_LIMIT_CONFIGS).find(
        (key) =>
            RATE_LIMIT_CONFIGS[key as keyof typeof RATE_LIMIT_CONFIGS].windowMs === config.windowMs &&
            RATE_LIMIT_CONFIGS[key as keyof typeof RATE_LIMIT_CONFIGS].maxRequests === config.maxRequests
    );

    const limiterType = configKey ? configToType[configKey] : "otpSend";
    const limiter = rateLimiters[limiterType];

    try {
        const result = await limiter.limit(identifier);

        return {
            success: result.success,
            remaining: result.remaining,
            resetIn: result.reset - Date.now(),
        };
    } catch (error) {
        console.error("Rate limit error:", error);
        return {
            success: false,
            remaining: 0,
            resetIn: 60000,
        };
    }
}

/**
 * 同步版本的 rate limit（已棄用）
 * @deprecated 請使用 async 版本的 rateLimit()
 * 注意：此函數使用 fail-closed 策略，始終返回失敗
 */
export function rateLimitSync(
    _identifier: string,
    _config: Partial<RateLimitConfig> = {}
): { success: boolean; remaining: number; resetIn: number } {
    console.error("rateLimitSync is deprecated and disabled. Use rateLimit (async) instead.");
    return { success: false, remaining: 0, resetIn: 60000 };
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
    const cfConnectingIP = request.headers.get("cf-connecting-ip");
    if (cfConnectingIP) {
        return cfConnectingIP;
    }
    const trueClientIP = request.headers.get("true-client-ip");
    if (trueClientIP) {
        return trueClientIP;
    }
    return `fallback_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

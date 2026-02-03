/**
 * Auth Feature - 認證模組
 * 公開 API
 *
 * ✅ 允許 import：Client Components、Server Components、頁面
 * ❌ 禁止 import：其他 features（用 Dependency Injection）
 *
 * Server-only exports 請用：
 * import { ... } from '@/features/auth/server'
 */

// ===== Components =====
export {
    SignInForm,
    SignUpForm,
    OtpForm,
    ResetPasswordForm,
    PermissionGate,
    RequireAuth,
    RequireRole,
    RequireAdmin,
    RequireStaff,
} from "./components";

// ===== Server Actions =====
export {
    sendOtpAction,
    verifyOtpAction,
    registerAction,
    changePasswordAction,
    resetPasswordSendAction,
    resetPasswordVerifyAction,
    resetPasswordAction,
} from "./actions";

// ===== Schemas =====
export {
    sendOtpSchema,
    verifyOtpSchema,
    registerSchema,
    changePasswordSchema,
    resetPasswordSendSchema,
    resetPasswordVerifySchema,
    resetPasswordSchema,
} from "./schemas";

// ===== Types =====
export type {
    SendOtpInput,
    VerifyOtpInput,
    RegisterInput,
    ChangePasswordInput,
    ResetPasswordSendInput,
    ResetPasswordVerifyInput,
    ResetPasswordInput,
} from "./schemas";

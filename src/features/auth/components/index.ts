/**
 * Auth Components - Index
 * 統一導出所有認證相關元件
 */

// ===== Common =====
export { OtpForm } from "./common";

// ===== Gates =====
export {
  PermissionGate,
  RequireAuth,
  RequireRole,
  RequireAdmin,
  RequireStaff,
} from "./gates";

// ===== SignIn =====
export { SignInForm } from "./signin";

// ===== SignUp =====
export { SignUpForm, SignUpFormStep, SignUpOtpStep, SignUpEmailFallback } from "./signup";
export type { SignUpStep, SignUpFormData } from "./signup";

// ===== ResetPassword =====
export {
  ResetPasswordForm,
  ResetPasswordRequestStep,
  ResetPasswordOtpStep,
  ResetPasswordNewStep,
  ResetPasswordSuccessStep,
} from "./reset-password";
export type { ResetMethod, ResetStep, ResetPasswordState } from "./reset-password";

export type ResetMethod = "phone" | "email";
export type ResetStep = "request" | "otp" | "new-password" | "success";

export interface ResetPasswordState {
    method: ResetMethod;
    phone: string;
    email: string;
}

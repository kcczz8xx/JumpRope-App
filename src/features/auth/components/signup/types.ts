export type SignUpStep = "form" | "otp" | "email-fallback";

export interface SignUpFormData {
    phone: string;
    password: string;
    confirmPassword: string;
    email: string;
    nickname: string;
    title: string;
}

export const TITLE_OPTIONS = [
    { value: "先生", label: "先生" },
    { value: "女士", label: "女士" },
    { value: "小姐", label: "小姐" },
];

export const INPUT_CLASS_NAME =
    "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800";

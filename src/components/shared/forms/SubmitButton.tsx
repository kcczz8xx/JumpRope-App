"use client";

interface SubmitButtonProps {
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
  type?: "submit" | "button";
  onClick?: () => void;
  size?: "sm" | "md";
  variant?: "primary" | "outline";
}

const LoadingSpinner = () => (
  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const sizeClasses = {
  sm: "px-4 py-3 text-sm",
  md: "px-5 py-3.5 text-sm",
};

const variantClasses = {
  primary:
    "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
  outline:
    "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
};

export function SubmitButton({
  isLoading = false,
  disabled = false,
  children,
  className = "w-full",
  loadingText = "處理中...",
  type = "submit",
  onClick,
  size = "sm",
  variant = "primary",
}: SubmitButtonProps) {
  const isDisabled = isLoading || disabled;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={`inline-flex items-center justify-center font-medium gap-2 rounded-lg transition ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${className} ${
        isDisabled ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      {isLoading && <LoadingSpinner />}
      {isLoading ? loadingText : children}
    </button>
  );
}

"use client";

interface SubmitButtonProps {
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
  type?: "submit" | "button";
  onClick?: () => void;
}

export function SubmitButton({
  isLoading = false,
  disabled = false,
  children,
  className = "w-full",
  loadingText = "處理中...",
  type = "submit",
  onClick,
}: SubmitButtonProps) {
  const isDisabled = isLoading || disabled;

  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-medium gap-2 rounded-lg transition px-4 py-3 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 ${className} ${
        isDisabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      disabled={isDisabled}
    >
      {isLoading ? loadingText : children}
    </button>
  );
}

import { cn } from "@/lib/utils";

const AlertCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export interface FormErrorProps {
  message?: string;
  className?: string;
  showIcon?: boolean;
  variant?: "inline" | "block";
}

export function FormError({
  message,
  className,
  showIcon = true,
  variant = "block",
}: FormErrorProps) {
  if (!message) return null;

  const isInline = variant === "inline";

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 text-sm text-error-600 dark:text-error-400",
        isInline
          ? "mt-1"
          : "mb-4 rounded-lg bg-error-50 p-3 dark:bg-error-500/10",
        className
      )}
    >
      {showIcon && <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />}
      <p>{message}</p>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";

export interface ResendCountdownProps {
  initialCount?: number;
  onResend: () => Promise<void> | void;
  disabled?: boolean;
  className?: string;
}

export function ResendCountdown({
  initialCount = 60,
  onResend,
  disabled = false,
  className,
}: ResendCountdownProps) {
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = useCallback(async () => {
    if (countdown > 0 || isResending || disabled) return;

    setIsResending(true);
    try {
      await onResend();
      setCountdown(initialCount);
    } finally {
      setIsResending(false);
    }
  }, [countdown, isResending, disabled, onResend, initialCount]);

  return (
    <div className={className}>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        沒有收到驗證碼？{" "}
        {countdown > 0 ? (
          <span className="text-gray-400">{countdown} 秒後可重新發送</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={disabled || isResending}
            className="text-brand-500 hover:text-brand-600 dark:text-brand-400 disabled:opacity-50"
          >
            {isResending ? "發送中..." : "重新發送"}
          </button>
        )}
      </p>
    </div>
  );
}

// Hook 版本 - 適用於需要更多控制的場景
export function useCountdown(initialCount = 60) {
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const startCountdown = useCallback(() => {
    setCountdown(initialCount);
  }, [initialCount]);

  const resetCountdown = useCallback(() => {
    setCountdown(0);
  }, []);

  return {
    countdown,
    isActive: countdown > 0,
    startCountdown,
    resetCountdown,
  };
}

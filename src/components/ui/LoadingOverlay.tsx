"use client";

import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import { useState, useEffect } from "react";

interface LoadingOverlayProps {
  isLoading: boolean;
  fullScreen?: boolean;
  delay?: number;
}

export default function LoadingOverlay({
  isLoading,
  fullScreen = true,
  delay = 200,
}: LoadingOverlayProps) {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isLoading) {
      // 只有當 loading 持續超過 delay 時間才顯示
      timer = setTimeout(() => {
        setShowLoader(true);
      }, delay);
    } else {
      setShowLoader(false);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isLoading, delay]);

  // 如果載入完成或還未超過延遲時間，不顯示
  if (!showLoader || !isLoading) return null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-[999999]",
        "animate-in fade-in duration-150",
        fullScreen ? "fixed inset-0" : "absolute inset-0"
      )}
    >
      <div className="flex flex-col items-center gap-6">
        <Image
          src="/images/logo/logo-icon.svg"
          alt="Logo"
          width={48}
          height={48}
          className="animate-pulse"
        />
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.3s]" />
          <div className="h-2.5 w-2.5 rounded-full bg-brand-500 animate-bounce [animation-delay:-0.15s]" />
          <div className="h-2.5 w-2.5 rounded-full bg-brand-500 animate-bounce" />
        </div>
      </div>
    </div>
  );
}

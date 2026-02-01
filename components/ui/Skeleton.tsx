"use client";

import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
    />
  );
}

export function SkeletonText({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-4 w-full", className)} />;
}

export function SkeletonCircle({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-10 w-10 rounded-full", className)} />;
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3",
        className
      )}
    >
      <div className="flex items-center gap-4 mb-6">
        <SkeletonCircle className="h-12 w-12" />
        <div className="flex-1 space-y-2">
          <SkeletonText className="w-1/3" />
          <SkeletonText className="w-1/2" />
        </div>
      </div>
      <div className="space-y-3">
        <SkeletonText />
        <SkeletonText className="w-4/5" />
        <SkeletonText className="w-3/5" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 overflow-hidden">
      <div className="border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonText key={i} className="flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4">
            {[1, 2, 3, 4].map((j) => (
              <SkeletonText key={j} className="flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonSidebar() {
  return (
    <div className="space-y-4 p-5">
      <Skeleton className="h-10 w-32 mb-8" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils/cn";
import React from "react";

// ============================================================================
// Base Skeleton
// ============================================================================

type AnimationType = "pulse" | "shimmer" | "none";

interface SkeletonProps {
  className?: string;
  animation?: AnimationType;
}

export function Skeleton({ className, animation = "shimmer" }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="載入中"
      className={cn(
        "rounded-md bg-gray-200 dark:bg-gray-700",
        animation === "pulse" && "animate-pulse",
        animation === "shimmer" &&
          "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-linear-to-r before:from-transparent before:via-white/60 before:to-transparent dark:before:via-white/10",
        className
      )}
    />
  );
}

// ============================================================================
// Skeleton Variants
// ============================================================================

export function SkeletonText({ className, animation }: SkeletonProps) {
  return (
    <Skeleton animation={animation} className={cn("h-4 w-full", className)} />
  );
}

export function SkeletonHeading({ className, animation }: SkeletonProps) {
  return (
    <Skeleton animation={animation} className={cn("h-7 w-48", className)} />
  );
}

export function SkeletonCircle({ className, animation }: SkeletonProps) {
  return (
    <Skeleton
      animation={animation}
      className={cn("h-10 w-10 rounded-full", className)}
    />
  );
}

export function SkeletonButton({ className, animation }: SkeletonProps) {
  return (
    <Skeleton
      animation={animation}
      className={cn("h-10 w-24 rounded-lg", className)}
    />
  );
}

export function SkeletonInput({ className, animation }: SkeletonProps) {
  return (
    <Skeleton
      animation={animation}
      className={cn("h-11 w-full rounded-lg", className)}
    />
  );
}

export function SkeletonBadge({ className, animation }: SkeletonProps) {
  return (
    <Skeleton
      animation={animation}
      className={cn("h-6 w-16 rounded-full", className)}
    />
  );
}

// ============================================================================
// Composite Skeletons
// ============================================================================

interface SkeletonCardProps extends SkeletonProps {
  showAvatar?: boolean;
  lines?: number;
}

export function SkeletonCard({
  className,
  animation,
  showAvatar = true,
  lines = 3,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3",
        className
      )}
    >
      {showAvatar && (
        <div className="flex items-center gap-4 mb-6">
          <SkeletonCircle animation={animation} className="h-12 w-12" />
          <div className="flex-1 space-y-2">
            <SkeletonText animation={animation} className="w-1/3" />
            <SkeletonText animation={animation} className="w-1/2" />
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonText
            key={i}
            animation={animation}
            className={cn(
              i === lines - 1 ? "w-3/5" : i === lines - 2 ? "w-4/5" : "w-full"
            )}
          />
        ))}
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  animation?: AnimationType;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  animation,
}: SkeletonTableProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 overflow-hidden">
      <div className="border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <SkeletonText key={i} animation={animation} className="flex-1" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4">
            {Array.from({ length: columns }).map((_, j) => (
              <SkeletonText key={j} animation={animation} className="flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonSidebar({ animation }: { animation?: AnimationType }) {
  return (
    <div className="space-y-4 p-5">
      <Skeleton animation={animation} className="h-10 w-32 mb-8" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} animation={animation} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Skeleton List Item
// ============================================================================

interface SkeletonListItemProps extends SkeletonProps {
  showAvatar?: boolean;
  showAction?: boolean;
}

export function SkeletonListItem({
  className,
  animation,
  showAvatar = true,
  showAction = false,
}: SkeletonListItemProps) {
  return (
    <div className={cn("flex items-center gap-4 py-4", className)}>
      {showAvatar && <SkeletonCircle animation={animation} />}
      <div className="flex-1 space-y-2">
        <SkeletonText animation={animation} className="w-1/3" />
        <SkeletonText animation={animation} className="w-2/3" />
      </div>
      {showAction && <SkeletonButton animation={animation} />}
    </div>
  );
}

// ============================================================================
// Skeleton Form
// ============================================================================

interface SkeletonFormProps {
  fields?: number;
  animation?: AnimationType;
}

export function SkeletonForm({ fields = 4, animation }: SkeletonFormProps) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonText animation={animation} className="h-4 w-24" />
          <SkeletonInput animation={animation} />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <SkeletonButton animation={animation} className="w-32" />
        <SkeletonButton animation={animation} className="w-24" />
      </div>
    </div>
  );
}

// ============================================================================
// Skeleton Stats Card
// ============================================================================

export function SkeletonStatsCard({
  animation,
}: {
  animation?: AnimationType;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
      <div className="flex items-center justify-between mb-4">
        <SkeletonText animation={animation} className="w-1/3 h-4" />
        <SkeletonCircle animation={animation} className="h-8 w-8" />
      </div>
      <Skeleton animation={animation} className="h-8 w-24 mb-2" />
      <SkeletonText animation={animation} className="w-1/2 h-3" />
    </div>
  );
}

// ============================================================================
// Skeleton Container (Conditional Rendering)
// ============================================================================

interface SkeletonContainerProps {
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  minHeight?: string;
}

export function SkeletonContainer({
  isLoading,
  skeleton,
  children,
  minHeight,
}: SkeletonContainerProps) {
  if (isLoading) {
    return <div style={{ minHeight }}>{skeleton}</div>;
  }
  return <>{children}</>;
}

// ============================================================================
// Page-Level Skeletons
// ============================================================================

interface SkeletonPageHeaderProps {
  animation?: AnimationType;
  showBreadcrumb?: boolean;
  showAction?: boolean;
}

export function SkeletonPageHeader({
  animation,
  showBreadcrumb = true,
  showAction = true,
}: SkeletonPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <SkeletonHeading animation={animation} className="w-24" />
      {showBreadcrumb && (
        <div className="flex items-center gap-1.5">
          <Skeleton animation={animation} className="h-4 w-8" />
          <Skeleton animation={animation} className="h-4 w-4" />
          <Skeleton animation={animation} className="h-4 w-12" />
        </div>
      )}
      {showAction && <SkeletonButton animation={animation} />}
    </div>
  );
}

interface SkeletonDataGridProps {
  rows?: number;
  cols?: number;
  animation?: AnimationType;
}

export function SkeletonDataGrid({
  rows = 3,
  cols = 2,
  animation,
}: SkeletonDataGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        cols === 2 && "md:grid-cols-2",
        cols === 3 && "md:grid-cols-3",
        cols === 4 && "md:grid-cols-2 lg:grid-cols-4"
      )}
    >
      {Array.from({ length: rows * cols }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonText animation={animation} className="w-20 h-3" />
          <SkeletonText animation={animation} className="w-full h-5" />
        </div>
      ))}
    </div>
  );
}

interface SkeletonSectionProps {
  animation?: AnimationType;
  showHeader?: boolean;
  showAction?: boolean;
  children?: React.ReactNode;
}

export function SkeletonSection({
  animation,
  showHeader = true,
  showAction = true,
  children,
}: SkeletonSectionProps) {
  return (
    <div className="space-y-5">
      {showHeader && (
        <div className="flex items-center justify-between">
          <SkeletonHeading animation={animation} className="w-28" />
          {showAction && (
            <Skeleton animation={animation} className="h-8 w-20 rounded-lg" />
          )}
        </div>
      )}
      {children || <SkeletonDataGrid animation={animation} />}
    </div>
  );
}

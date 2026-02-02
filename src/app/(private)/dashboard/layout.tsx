"use client";

import { useSidebar } from "@/lib/providers/SidebarContext";
import { usePermission } from "@/hooks/usePermission";
import AppHeader from "@/components/layout/private/AppHeader";
import AppSidebar from "@/components/layout/private/AppSidebar";
import AppFooter from "@/components/layout/private/AppFooter";
import Backdrop from "@/components/layout/private/Backdrop";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import React from "react";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { isLoading: isAuthLoading } = usePermission();
  const pathname = usePathname();

  // Route-specific styles for the main content container
  const getRouteSpecificStyles = () => {
    switch (pathname) {
      case "/text-generator":
        return "";
      case "/code-generator":
        return "";
      case "/image-generator":
        return "";
      case "/video-generator":
        return "";
      default:
        return "p-4 mx-auto w-full max-w-(--breakpoint-2xl) md:p-6";
    }
  };

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "xl:ml-[290px]"
    : "xl:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      {/* Loading Overlay for auth check */}
      <LoadingOverlay isLoading={isAuthLoading} />
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <ErrorBoundary>
          <div className={`grow ${getRouteSpecificStyles()}`}>{children}</div>
        </ErrorBoundary>

        {/* Footer */}
        <AppFooter />
      </div>
    </div>
  );
}

"use client";

import { useSidebar } from "@/lib/providers/SidebarContext";
import AppHeader from "@/components/layout/private/AppHeader";
import AppSidebar from "@/components/layout/private/AppSidebar";
import AppFooter from "@/components/layout/private/AppFooter";
import Backdrop from "@/components/layout/private/Backdrop";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import React from "react";
import { usePathname } from "next/navigation";

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const pathname = usePathname();

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

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "xl:ml-[290px]"
    : "xl:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader />
        <ErrorBoundary>
          <div className={`grow ${getRouteSpecificStyles()}`}>{children}</div>
        </ErrorBoundary>
        <AppFooter />
      </div>
    </div>
  );
}

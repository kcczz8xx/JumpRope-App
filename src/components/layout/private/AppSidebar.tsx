"use client";
import React, { useEffect, useCallback, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/lib/providers/SidebarContext";
import { usePermission } from "@/hooks/usePermission";
import { cn } from "@/lib/utils/cn";
import { HorizontaLDots } from "@/icons/index";
import {
  mainNavItems,
  othersNavItems,
  supportNavItems,
  type NavItem,
} from "@/config/sidebar-nav";
import { SidebarLogo, NavMenuItem } from "./sidebar";

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { can, isLoading } = usePermission();
  const pathname = usePathname();

  // 根據權限過濾選單項目
  const filterNavItems = useCallback(
    (items: NavItem[]): NavItem[] => {
      return items
        .filter((item) => !item.permission || can(item.permission))
        .map((item) => ({
          ...item,
          subItems: item.subItems?.filter(
            (subItem) => !subItem.permission || can(subItem.permission)
          ),
        }))
        .filter((item) => !item.subItems || item.subItems.length > 0);
    },
    [can]
  );

  const navItems = useMemo(
    () => filterNavItems(mainNavItems),
    [filterNavItems]
  );
  const othersItems = useMemo(
    () => filterNavItems(othersNavItems),
    [filterNavItems]
  );
  const supportItems = useMemo(
    () => filterNavItems(supportNavItems),
    [filterNavItems]
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "support" | "others";
    index: number;
  } | null>(null);

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  // 記錄上一次的 pathname，用於判斷是否為路徑變化觸發
  // 使用 null 作為初始值，區分「首次載入」和「後續渲染」
  const prevPathnameRef = React.useRef<string | null>(null);

  // 自動展開當前路徑所在的子選單（僅在路徑變化或初次載入時）
  useEffect(() => {
    // 權限還在載入中，先不處理
    if (isLoading) return;

    const isFirstMount = prevPathnameRef.current === null;
    const isPathnameChanged = prevPathnameRef.current !== pathname;
    prevPathnameRef.current = pathname;

    // 只在首次載入或路徑變化時才自動展開，不干擾用戶手動操作
    if (!isFirstMount && !isPathnameChanged) return;

    const menuMap = {
      main: navItems,
      support: supportItems,
      others: othersItems,
    };

    let matchedSubmenu: {
      type: "main" | "support" | "others";
      index: number;
    } | null = null;

    (["main", "support", "others"] as const).forEach((menuType) => {
      menuMap[menuType].forEach((nav, index) => {
        if (nav.subItems?.some((subItem) => subItem.path === pathname)) {
          matchedSubmenu = { type: menuType, index };
        }
      });
    });

    // 首次載入或路徑變化時，展開對應的子選單（若有匹配）
    if (matchedSubmenu) {
      setOpenSubmenu(matchedSubmenu);
    }
  }, [pathname, isLoading, navItems, supportItems, othersItems]);

  // 顯示完整內容的條件
  const showContent = isExpanded || isHovered || isMobileOpen;
  const isCollapsed = !isExpanded && !isHovered;

  const handleSubmenuToggle = (
    index: number,
    menuType: "main" | "support" | "others"
  ) => {
    setOpenSubmenu((prev) =>
      prev?.type === menuType && prev?.index === index
        ? null
        : { type: menuType, index }
    );
  };

  const renderMenuItems = (
    items: NavItem[],
    menuType: "main" | "support" | "others"
  ) => (
    <ul className="flex flex-col gap-1">
      {items.map((nav, index) => (
        <NavMenuItem
          key={nav.name}
          nav={nav}
          index={index}
          menuType={menuType}
          isSubmenuOpen={
            openSubmenu?.type === menuType && openSubmenu?.index === index
          }
          showContent={showContent}
          isCollapsed={isCollapsed}
          isActive={isActive}
          onToggleSubmenu={handleSubmenuToggle}
        />
      ))}
    </ul>
  );

  return (
    <aside
      className={cn(
        "fixed flex flex-col xl:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-full transition-all duration-300 ease-in-out z-50 border-r border-gray-200",
        showContent ? "w-[290px]" : "w-[90px]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full",
        "xl:translate-x-0"
      )}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "py-8 flex",
          isCollapsed ? "xl:justify-center" : "justify-start"
        )}
      >
        <SidebarLogo showFull={showContent} />
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={cn(
                  "mb-4 text-xs uppercase flex leading-5 text-gray-400",
                  isCollapsed ? "xl:justify-center" : "justify-start"
                )}
              >
                {showContent ? "Menu" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;

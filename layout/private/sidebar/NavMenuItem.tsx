"use client";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { ChevronDownIcon } from "@/icons/index";
import type { NavItem } from "@/config/sidebar-nav";
import NavSubMenu from "./NavSubMenu";

interface NavMenuItemProps {
  nav: NavItem;
  index: number;
  menuType: "main" | "support" | "others";
  isSubmenuOpen: boolean;
  showContent: boolean;
  isCollapsed: boolean;
  isActive: (path: string) => boolean;
  onToggleSubmenu: (index: number, menuType: "main" | "support" | "others") => void;
}

export default function NavMenuItem({
  nav,
  index,
  menuType,
  isSubmenuOpen,
  showContent,
  isCollapsed,
  isActive,
  onToggleSubmenu,
}: NavMenuItemProps) {
  const hasSubItems = !!nav.subItems;
  const isItemActive = nav.path ? isActive(nav.path) : isSubmenuOpen;

  if (hasSubItems) {
    return (
      <li>
        <button
          onClick={() => onToggleSubmenu(index, menuType)}
          className={cn(
            "menu-item group cursor-pointer",
            isSubmenuOpen ? "menu-item-active" : "menu-item-inactive",
            isCollapsed ? "lg:justify-center" : "lg:justify-start"
          )}
        >
          <span
            className={cn(
              isSubmenuOpen ? "menu-item-icon-active" : "menu-item-icon-inactive"
            )}
          >
            {nav.icon}
          </span>
          {showContent && <span className="menu-item-text">{nav.name}</span>}
          {nav.new && showContent && (
            <span
              className={cn(
                "ml-auto absolute right-10 menu-dropdown-badge",
                isSubmenuOpen
                  ? "menu-dropdown-badge-active"
                  : "menu-dropdown-badge-inactive"
              )}
            >
              new
            </span>
          )}
          {showContent && (
            <ChevronDownIcon
              className={cn(
                "ml-auto w-5 h-5 transition-transform duration-200",
                isSubmenuOpen && "rotate-180 text-brand-500"
              )}
            />
          )}
        </button>
        {showContent && (
          <NavSubMenu
            subItems={nav.subItems!}
            isOpen={isSubmenuOpen}
            isActive={isActive}
          />
        )}
      </li>
    );
  }

  if (!nav.path) return null;

  return (
    <li>
      <Link
        href={nav.path}
        className={cn(
          "menu-item group",
          isItemActive ? "menu-item-active" : "menu-item-inactive"
        )}
      >
        <span
          className={cn(
            isItemActive ? "menu-item-icon-active" : "menu-item-icon-inactive"
          )}
        >
          {nav.icon}
        </span>
        {showContent && <span className="menu-item-text">{nav.name}</span>}
      </Link>
    </li>
  );
}

"use client";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import type { NavSubItem } from "@/config/sidebar-nav";

interface NavSubMenuProps {
  subItems: NavSubItem[];
  isOpen: boolean;
  isActive: (path: string) => boolean;
}

export default function NavSubMenu({
  subItems,
  isOpen,
  isActive,
}: NavSubMenuProps) {
  const contentRef = useRef<HTMLUListElement>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen, subItems]);

  return (
    <div
      className="overflow-hidden transition-[height] duration-300 ease-in-out"
      style={{ height }}
    >
      <ul ref={contentRef} className="mt-2 space-y-1 ml-9">
        {subItems.map((subItem) => {
          const active = isActive(subItem.path);
          return (
            <li key={subItem.name}>
              <Link
                href={subItem.path}
                className={cn(
                  "menu-dropdown-item",
                  active
                    ? "menu-dropdown-item-active"
                    : "menu-dropdown-item-inactive"
                )}
              >
                {subItem.name}
                <span className="flex items-center gap-1 ml-auto">
                  {subItem.new && (
                    <span
                      className={cn(
                        "ml-auto menu-dropdown-badge",
                        active
                          ? "menu-dropdown-badge-active"
                          : "menu-dropdown-badge-inactive"
                      )}
                    >
                      new
                    </span>
                  )}
                  {subItem.pro && (
                    <span
                      className={cn(
                        "ml-auto menu-dropdown-badge-pro",
                        active
                          ? "menu-dropdown-badge-pro-active"
                          : "menu-dropdown-badge-pro-inactive"
                      )}
                    >
                      pro
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

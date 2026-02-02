"use client";
import Link from "next/link";
import Logo from "@/components/ui/Logo";

interface SidebarLogoProps {
  showFull: boolean;
}

export default function SidebarLogo({ showFull }: SidebarLogoProps) {
  return (
    <Link href="/" aria-label="首頁">
      <Logo variant={showFull ? "full" : "icon"} />
    </Link>
  );
}

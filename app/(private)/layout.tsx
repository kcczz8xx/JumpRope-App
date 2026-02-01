import { Outfit } from "next/font/google";
import type { Viewport } from "next";
import "./globals.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { TenantProvider } from "@/context/TenantContext";
import { PermissionProvider } from "@/context/PermissionContext";
import { TenantThemeProvider } from "@/components/tailadmin/layout/TenantThemeProvider";
import SessionProvider from "@/context/SessionProvider";

const outfit = Outfit({
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <SessionProvider>
          <AuthProvider>
            <TenantProvider>
              <PermissionProvider>
                <ThemeProvider>
                  <TenantThemeProvider>
                    <SidebarProvider>{children}</SidebarProvider>
                  </TenantThemeProvider>
                </ThemeProvider>
              </PermissionProvider>
            </TenantProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

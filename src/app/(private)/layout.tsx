import { Outfit } from "next/font/google";
import type { Viewport } from "next";
import "./globals.css";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import { SidebarProvider } from "@/lib/providers/SidebarContext";
import { ThemeProvider } from "@/lib/providers/ThemeContext";
import SessionProvider from "@/lib/providers/SessionProvider";
import { SWRProvider } from "@/lib/providers/SWRProvider";
import { Toaster } from "@/components/ui/Toaster";

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
          <SWRProvider>
            <ThemeProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </ThemeProvider>
          </SWRProvider>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}

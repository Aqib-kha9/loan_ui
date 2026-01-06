import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BlendedSidebar } from "@/components/layout/BlendedSidebar";

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SettingsProvider } from "@/components/providers/settings-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinCorp ERP",
  description: "Finance Office Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} overflow-hidden transition-colors duration-500`} style={{ backgroundColor: 'var(--app-shell-bg)' }}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider>
            <div className="flex h-screen w-full overflow-hidden">
              {/* Blended Sidebar (Sits on Dark Background) */}
              <BlendedSidebar className="hidden md:flex shrink-0 transition-all duration-300" />

              {/* Main Workspace (The White Sheet) */}
              <div className="flex flex-col flex-1 h-full overflow-hidden relative">
                {/* This div creates the 'Paper Card' effect */}
                <div className="flex-1 flex flex-col bg-background md:rounded-tl-3xl md:my-2 md:mr-2 md:ml-1 overflow-hidden shadow-2xl ring-1 ring-black/5 relative transition-colors duration-500">
                  {/* Header inside the sheet */}


                  <main className="flex-1 overflow-y-auto p-0 scroll-smooth bg-muted/20">
                    <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-3 duration-500">
                      {children}
                    </div>
                  </main>
                </div>
              </div>
            </div>
            <Toaster />
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
